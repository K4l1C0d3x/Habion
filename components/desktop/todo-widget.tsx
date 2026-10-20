'use client'

import { useState } from 'react'
import { Check, Plus, ArrowUpRight } from 'lucide-react'
import { useTodoStore, todoStore } from '@/lib/todo-store'

export function TodoWidget() {
  const { todos } = useTodoStore()
  const [input, setInput] = useState('')

  // Show today's tasks first, followed by others, max 4 items in widget
  const widgetTodos = todos
    .slice()
    .sort((a, b) => {
      if (a.done === b.done) {
        if (a.category === 'today' && b.category !== 'today') return -1
        if (b.category === 'today' && a.category !== 'today') return 1
        return b.createdAt - a.createdAt
      }
      return a.done ? 1 : -1
    })
    .slice(0, 4)

  const pendingCount = todos.filter((t) => !t.done).length

  function handleAdd() {
    if (!input.trim()) return
    todoStore.addTodo(input, 'today')
    setInput('')
  }

  return (
    <div className="widget flex w-full flex-col gap-2.5 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          onClick={() => todoStore.openApp()}
          className="flex items-center gap-2 cursor-pointer group"
          title="Open Reminders App"
        >
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase group-hover:text-foreground transition-colors">
            To-do
          </span>
          <span suppressHydrationWarning className="text-[10px] font-semibold text-muted-foreground/70">
            {pendingCount} left
          </span>
        </div>

        {/* Open Full App Button */}
        <button
          type="button"
          onClick={() => todoStore.openApp()}
          onPointerDown={(e) => e.stopPropagation()}
          title="Open Reminders App"
          className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      {/* Quick Add Bar */}
      <div className="flex gap-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="New task…"
          className="flex-1 rounded-lg bg-muted px-2.5 py-1 text-xs outline-none focus:bg-muted/80"
        />
        <button
          type="button"
          onClick={handleAdd}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-foreground text-background hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          title="Add task"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Tasks List */}
      <ul className="flex flex-col gap-1">
        {widgetTodos.map((todo) => (
          <li key={todo.id}>
            <button
              type="button"
              onClick={() => todoStore.toggleTodo(todo.id)}
              onPointerDown={(e) => e.stopPropagation()}
              className={`group flex w-full items-center justify-between rounded-lg px-2 py-1 text-left transition-all ${
                todo.done ? 'bg-muted/30' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    todo.done
                      ? 'border-signal bg-signal text-white shadow-xs'
                      : 'border-muted-foreground/40 group-hover:border-foreground/80'
                  }`}
                >
                  {todo.done && <Check className="size-2.5 stroke-[3]" />}
                </div>
                <span
                  className={`truncate text-xs font-medium transition-colors ${
                    todo.done
                      ? 'line-through text-muted-foreground/60'
                      : 'text-foreground'
                  }`}
                >
                  {todo.text}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
