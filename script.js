class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.stats = document.getElementById('stats');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompleted = document.getElementById('clearCompleted');
        
        this.initEventListeners();
        this.render();
    }

    initEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render()
    }

    clearCompletedTodos() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
    }

    render() {
        if (this.todos.length === 0) {
            this.emptyState.style.display = 'block';
            this.stats.style.display = 'none';
            return;
        }

        this.emptyState.style.display = 'none';
        this.stats.style.display = 'flex';

        // Sort todos: incomplete tasks first, then completed tasks
        const sortedTodos = [...this.todos].sort((a, b) => {
            // If completion status is different, sort by completion (false first)
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }
            // If both have same completion status, sort by creation date (newest first for incomplete, oldest first for completed)
            if (!a.completed && !b.completed) {
                return new Date(b.createdAt) - new Date(a.createdAt); // Newest incomplete first
            } else {
                return new Date(a.createdAt) - new Date(b.createdAt); // Oldest completed first
            }
        });

        // Separate completed and incomplete todos
        const incompleteTodos = sortedTodos.filter(todo => !todo.completed);
        const completedTodos = sortedTodos.filter(todo => todo.completed);

        let todoHTML = '';

        // Add incomplete todos
        if (incompleteTodos.length > 0) {
            todoHTML += incompleteTodos.map(todo => `
                <div class="todo-item">
                    <input type="checkbox" class="todo-checkbox" 
                           onchange="app.toggleTodo(${todo.id})">
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">🗑️</button>
                </div>
            `).join('');
        }

        // Add separator if both incomplete and completed todos exist
        if (incompleteTodos.length > 0 && completedTodos.length > 0) {
            todoHTML += `
                <div class="section-separator">
                    <div class="separator-line"></div>
                    <span class="separator-text">Tugas Selesai (${completedTodos.length})</span>
                    <div class="separator-line"></div>
                </div>
            `;
        }

        // Add completed todos
        if (completedTodos.length > 0) {
            todoHTML += completedTodos.map(todo => `
                <div class="todo-item completed">
                    <input type="checkbox" class="todo-checkbox" checked 
                           onchange="app.toggleTodo(${todo.id})">
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">🗑️</button>
                </div>
            `).join('');
        }

        // If no todos to display, show empty state
        if (todoHTML.trim() === '') {
            this.emptyState.style.display = 'block';
            this.stats.style.display = 'none';
            return;
        }

        this.todoList.innerHTML = todoHTML;

        // Update stats
        const totalTasks = this.todos.length;
        const completedTasks = this.todos.filter(t => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        this.taskCount.textContent = `${totalTasks} tugas (${completedTasks} selesai, ${pendingTasks} tersisa)`;
        this.clearCompleted.style.display = completedTasks > 0 ? 'block' : 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        try {
            const saved = localStorage.getItem('todos');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    const app = new TodoApp();
    
    // Make app globally accessible for onclick handlers
    window.app = app;

    // Add some sample data on first load
    if (app.todos.length === 0) {
        const sampleTodos = [
            { id: 1, text: "Belajar HTML, CSS, dan JavaScript", completed: false, createdAt: new Date().toISOString() },
            { id: 2, text: "Membuat to-do list yang keren", completed: true, createdAt: new Date().toISOString() },
            { id: 3, text: "Latihan coding setiap hari", completed: false, createdAt: new Date().toISOString() },
            { id: 4, text: "Test tugas baru", completed: false, createdAt: new Date().toISOString() },
            { id: 5, text: "New Objective", completed: true, createdAt: new Date().toISOString() }
        ];
        app.todos = sampleTodos;
        app.saveTodos();
        app.render();
    }
});
