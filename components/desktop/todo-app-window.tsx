'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Check,
  Plus,
  Trash2,
  Search,
  Calendar,
  Briefcase,
  User,
  Star,
  CheckCircle2,
  ListTodo,
  Sparkles,
  RotateCcw,
} from 'lucide-react'
import { useTodoStore, todoStore, type TodoFilter, type TodoCategory } from '@/lib/todo-store'

interface CategoryConfig {
  id: TodoFilter
  label: string
  icon: typeof Calendar
  color: string
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'today', label: 'Today', icon: Calendar, color: 'text-signal' },
  { id: 'work', label: 'Work', icon: Briefcase, color: 'text-blue-500' },
  { id: 'personal', label: 'Personal', icon: User, color: 'text-emerald-500' },
  { id: 'important', label: 'Important', icon: Star, color: 'text-amber-500' },
  { id: 'all', label: 'All Tasks', icon: ListTodo, color: 'text-purple-500' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-muted-foreground' },
]

export function TodoAppWindow() {
  const { todos, isAppOpen, activeFilter, searchQuery } = useTodoStore()
  const [inputText, setInputText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory>('today')
  const [isMaximized, setIsMaximized] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isAppOpen) {
        todoStore.closeApp()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAppOpen])

  // Category counts
  const counts = useMemo(() => {
    return {
      today: todos.filter((t) => t.category === 'today' && !t.done).length,
      work: todos.filter((t) => t.category === 'work' && !t.done).length,
      personal: todos.filter((t) => t.category === 'personal' && !t.done).length,
      important: todos.filter((t) => t.category === 'important' && !t.done).length,
      all: todos.filter((t) => !t.done).length,
      completed: todos.filter((t) => t.done).length,
    }
  }, [todos])

  // Filtered tasks
  const displayedTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Category filter
      if (activeFilter === 'completed') {
        if (!todo.done) return false
      } else if (activeFilter === 'all') {
        // show all active tasks unless searching
      } else {
        if (todo.category !== activeFilter) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return todo.text.toLowerCase().includes(query)
      }

      return true
    })
  }, [todos, activeFilter, searchQuery])

  function handleAdd() {
    if (!inputText.trim()) return
    const cat = activeFilter === 'all' || activeFilter === 'completed' ? selectedCategory : (activeFilter as TodoCategory)
    todoStore.addTodo(inputText, cat)
    setInputText('')
  }

  if (!isAppOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={() => todoStore.closeApp()}
        aria-hidden="true"
      />

      {/* Main Window */}
      <div
        ref={windowRef}
        className={`relative z-10 flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-card text-card-foreground shadow-[0_25px_50px_-12px_rgb(0_0_0/0.3),0_0_0_1px_rgb(0_0_0/0.05)] transition-all duration-300 ${
          isMaximized
            ? 'h-[85vh] w-[92vw] max-w-5xl'
            : 'h-[540px] max-h-[90vh] w-full max-w-2xl'
        }`}
      >
        {/* macOS Title Bar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4 select-none">
          {/* Traffic Light Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => todoStore.closeApp()}
              title="Close"
              className="group flex size-3 items-center justify-center rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[8px] font-bold text-black/60 opacity-0 group-hover:opacity-100">✕</span>
            </button>
            <button
              onClick={() => todoStore.closeApp()}
              title="Minimize"
              className="group flex size-3 items-center justify-center rounded-full bg-[#febc2e] border border-[#d89e24] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[8px] font-bold text-black/60 opacity-0 group-hover:opacity-100">−</span>
            </button>
            <button
              onClick={() => setIsMaximized((m) => !m)}
              title={isMaximized ? 'Restore' : 'Maximize'}
              className="group flex size-3 items-center justify-center rounded-full bg-[#28c840] border border-[#1aab29] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[7px] font-bold text-black/60 opacity-0 group-hover:opacity-100">⤢</span>
            </button>
          </div>

          {/* Window Title */}
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
            <ListTodo className="size-4 text-signal" />
            <span>Reminders</span>
          </div>

          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2 size-3 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => todoStore.setSearchQuery(e.target.value)}
              placeholder="Search tasks…"
              className="h-7 w-32 md:w-44 rounded-md bg-muted/70 pl-7 pr-2 text-xs outline-none focus:bg-background focus:ring-1 focus:ring-border transition-all"
            />
          </div>
        </div>

        {/* Window Body (Split View) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <aside className="hidden sm:flex w-48 shrink-0 flex-col justify-between border-r border-border bg-muted/20 p-2.5">
            <nav className="flex flex-col gap-1">
              <span className="px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Lists
              </span>
              {CATEGORIES.map(({ id, label, icon: Icon, color }) => {
                const isActive = activeFilter === id
                const count = counts[id]
                return (
                  <button
                    key={id}
                    onClick={() => todoStore.setActiveFilter(id)}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-foreground text-background shadow-xs font-semibold'
                        : 'text-foreground/80 hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`size-3.5 ${isActive ? 'text-background' : color}`} />
                      <span>{label}</span>
                    </div>
                    {count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold tabular-nums ${
                          isActive
                            ? 'bg-background/20 text-background'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-border pt-2 flex items-center justify-between px-1">
              <button
                onClick={() => todoStore.resetToDefaults()}
                title="Reset sample tasks"
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="size-3" />
                <span>Reset demo</span>
              </button>
              {counts.completed > 0 && (
                <button
                  onClick={() => todoStore.clearCompleted()}
                  className="text-[11px] text-destructive hover:underline"
                >
                  Clear done
                </button>
              )}
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="flex flex-1 flex-col overflow-hidden bg-card p-4 sm:p-6">
            {/* Mobile Category Tabs */}
            <div className="flex sm:hidden gap-1.5 overflow-x-auto pb-3 mb-2 border-b border-border">
              {CATEGORIES.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => todoStore.setActiveFilter(id)}
                  className={`rounded-full px-3 py-1 text-xs whitespace-nowrap font-medium transition-colors ${
                    activeFilter === id
                      ? 'bg-foreground text-background font-semibold'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Content Header */}
            <div className="flex items-center justify-between pb-3">
              <div>
                <h2 className="text-xl font-bold capitalize text-foreground">
                  {activeFilter === 'all' ? 'All Tasks' : activeFilter}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {displayedTodos.length} {displayedTodos.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              {/* Category pill selector for new task (when in 'all' view) */}
              {(activeFilter === 'all' || activeFilter === 'completed') && (
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 text-xs">
                  {(['today', 'work', 'personal', 'important'] as TodoCategory[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`px-2 py-0.5 rounded-md capitalize font-medium transition-all ${
                        selectedCategory === c
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Bar */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1.5 focus-within:border-foreground/30 focus-within:bg-card focus-within:ring-2 focus-within:ring-ring/20 transition-all mb-4">
              <input
                type="text"
                value={inputText}
                maxLength={200}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={`Add task to ${activeFilter === 'all' || activeFilter === 'completed' ? selectedCategory : activeFilter}… (Press Enter)`}
                className="flex-1 bg-transparent px-2.5 py-1 text-xs outline-none"
              />
              <button
                onClick={handleAdd}
                className="flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto pr-1">
              {displayedTodos.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <Sparkles className="size-8 text-muted-foreground/40" />
                  <p className="text-xs font-medium">No tasks found</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    {searchQuery ? 'Try a different search term' : 'Add your first task above'}
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {displayedTodos.map((todo) => {
                    return (
                      <li
                        key={todo.id}
                        className={`group flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition-all ${
                          todo.done
                            ? 'border-transparent bg-muted/30 text-muted-foreground/60'
                            : 'border-border/60 bg-card hover:border-border hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Checkbox button */}
                          <button
                            type="button"
                            onClick={() => todoStore.toggleTodo(todo.id)}
                            className={`flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer ${
                              todo.done
                                ? 'border-signal bg-signal text-white shadow-xs'
                                : 'border-muted-foreground/40 hover:border-foreground'
                            }`}
                          >
                            {todo.done && <Check className="size-3 stroke-[3]" />}
                          </button>

                          {/* Task text */}
                          <span
                            onClick={() => todoStore.toggleTodo(todo.id)}
                            className={`truncate cursor-pointer select-none font-medium ${
                              todo.done ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {todo.text}
                          </span>
                        </div>

                        {/* Right side category & delete */}
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                            {todo.category}
                          </span>
                          <button
                            onClick={() => todoStore.removeTodo(todo.id)}
                            title="Delete task"
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
