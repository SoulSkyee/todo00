class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.todoInput = document.getElementById('todoInput');
        this.prioritySelect = document.getElementById('prioritySelect');
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
        
        // Add click handlers for suggestion chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const suggestionText = e.target.textContent.trim();
                this.addSuggestionTodo(suggestionText);
            }
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        const priority = this.prioritySelect.value;
        if (!text) {
            this.todoInput.focus();
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.prioritySelect.value = 'medium'; // Reset to default
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
        this.render();
    }

    clearCompletedTodos() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) return;
        
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
        
        // Show feedback notification
        this.showNotification(`${completedCount} tugas selesai telah dihapus`, 'success');
    }

    addSuggestionTodo(suggestionText) {
        // Extract just the text part (remove emoji)
        const cleanText = suggestionText.replace(/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
        
        // Map suggestions to priorities
        let priority = 'medium';
        if (cleanText.includes('Olahraga')) priority = 'high';
        if (cleanText.includes('Coding')) priority = 'high';
        if (cleanText.includes('Main game')) priority = 'low';

        const todo = {
            id: Date.now(),
            text: cleanText,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        
        // Show success notification
        this.showNotification(`Tugas "${cleanText}" berhasil ditambahkan`, 'success');
    }

   
    showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add notification to DOM
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    render() {
        // Show empty state ONLY if no tasks exist at all
        // (not when all tasks are completed - let users see their completed tasks)
        if (this.todos.length === 0) {
            this.todoList.innerHTML = '';
            this.emptyState.style.display = 'block';
            this.stats.style.display = 'none';
            return;
        }

        this.emptyState.style.display = 'none';
        this.stats.style.display = 'flex';

        // Priority order for sorting
        const priorityOrder = { high: 3, medium: 2, low: 1 };

        // Sort todos: incomplete tasks first (by priority then date), then completed tasks
        const sortedTodos = [...this.todos].sort((a, b) => {
            // If completion status is different, sort by completion (false first)
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }
            
            // If both have same completion status, sort by priority first
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;
            
            if (aPriority !== bPriority) {
                return bPriority - aPriority; // Higher priority first
            }
            
            // If same priority, sort by creation date
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
                <div class="todo-item priority-${todo.priority || 'medium'}">
                    <input type="checkbox" class="todo-checkbox" 
                           onchange="app.toggleTodo(${todo.id})">
                    <div class="priority-indicator ${todo.priority || 'medium'}"></div>
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <span class="priority-label ${todo.priority || 'medium'}">${this.getPriorityLabel(todo.priority)}</span>
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
                <div class="todo-item completed priority-${todo.priority || 'medium'}">
                    <input type="checkbox" class="todo-checkbox" checked 
                           onchange="app.toggleTodo(${todo.id})">
                    <div class="priority-indicator ${todo.priority || 'medium'}"></div>
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <span class="priority-label ${todo.priority || 'medium'}">${this.getPriorityLabel(todo.priority)}</span>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">🗑️</button>
                </div>
            `).join('');
        }

        // Set the HTML content
        this.todoList.innerHTML = todoHTML;

        // Update stats
        const totalTasks = this.todos.length;
        const completedTasks = this.todos.filter(t => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const highPriorityTasks = this.todos.filter(t => !t.completed && t.priority === 'high').length;

        this.taskCount.textContent = `${totalTasks} tugas (${completedTasks} selesai, ${pendingTasks} tersisa${highPriorityTasks > 0 ? `, ${highPriorityTasks} prioritas tinggi` : ''})`;
        this.clearCompleted.style.display = completedTasks > 0 ? 'block' : 'none';
    }

    getPriorityLabel(priority) {
        const labels = {
            high: '🔴 Tinggi',
            medium: '🟡 Sedang',
            low: '🟢 Rendah'
        };
        return labels[priority] || labels.medium;
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

    // Helper function to clear all data (for testing)
    clearAllData() {
        localStorage.removeItem('todos');
        this.todos = [];
        this.render();
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
        console.log('Loading sample data...');
        const sampleTodos = [
            { id: 1, text: "Tambah tugas", priority: "high", completed: false, createdAt: new Date().toISOString() },
            { id: 2, text: "Membuat to-do list yang keren", priority: "medium", completed: true, createdAt: new Date().toISOString() },
            { id: 3, text: "Ubah prioritas", priority: "medium", completed: false, createdAt: new Date().toISOString() },
            { id: 4, text: "Finished job is here", priority: "high", completed: true, createdAt: new Date().toISOString() },
            { id: 5, text: "Tugas baru dengan ID 5", priority: "low", completed: false, createdAt: new Date().toISOString() },
            { id: 6, text: "Add ID 6", priority: "low", completed: false, createdAt: new Date().toISOString() }
        ];
        app.todos = sampleTodos;
        console.log('Sample todos loaded:', app.todos);
        app.saveTodos();
        app.render();
    } else {
        console.log('Existing todos found:', app.todos);
    }
});
