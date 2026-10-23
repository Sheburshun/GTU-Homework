const form = document.getElementById('task-form');
const dialog = document.getElementById('task-dialog');
let tasks = [];
let editingId = null;

async function loadTasks() {
  try {
    const response = await fetch('/api/tasks');
    tasks = await response.json();
    showTasks();
  } catch (error) {
    alert('Could not load tasks');
  }
}

function showTasks() {
  for (let semester = 1; semester <= 2; semester++) {
    const container = document.getElementById('tasks-' + semester);
    const list = tasks.filter(task => task.semester === semester);
    container.innerHTML = '';
    document.getElementById('count-' + semester).textContent = list.length + ' tasks';

    if (list.length === 0) {
      container.innerHTML = '<div class="empty">No tasks yet. Add your first assignment!</div>';
    }

    for (const task of list) {
      const row = document.createElement('div');
      row.className = 'task-row';
      const details = document.createElement('div');
      const title = document.createElement('div');
      title.className = 'task-title';
      title.textContent = task.title;
      if (task.completed) title.style.textDecoration = 'line-through';
      const description = document.createElement('div');
      description.className = 'task-desc';
      description.textContent = task.description || 'No description';
      details.append(title, description);

      const deadline = document.createElement('div');
      deadline.className = 'date';
      deadline.textContent = task.deadline || 'No deadline';

      const statusCell = document.createElement('div');
      const status = document.createElement('button');
      status.className = 'status' + (task.completed ? ' completed' : '');
      status.textContent = task.completed ? '✓ Completed' : '○ In progress';
      status.onclick = () => changeStatus(task);
      statusCell.appendChild(status);

      const actions = document.createElement('div');
      actions.className = 'actions';
      const edit = document.createElement('button');
      edit.className = 'icon-button';
      edit.textContent = '✎';
      edit.title = 'Edit task';
      edit.onclick = () => openForm(task.semester, task);
      const remove = document.createElement('button');
      remove.className = 'icon-button';
      remove.textContent = '×';
      remove.title = 'Delete task';
      remove.onclick = () => deleteTask(task.id);
      actions.append(edit, remove);
      row.append(details, deadline, statusCell, actions);
      container.appendChild(row);
    }
  }
  document.getElementById('total-count').textContent = tasks.length + ' tasks across 2 semesters';
}

function updateCounts() {
  document.getElementById('title-count').textContent = document.getElementById('title').value.length + '/128';
  document.getElementById('description-count').textContent = document.getElementById('description').value.length + '/500';
}

function openForm(semester = 1, task = null) {
  form.reset();
  editingId = task ? task.id : null;
  document.getElementById('dialog-heading').textContent = task ? 'Edit task' : 'New task';
  document.getElementById('title').value = task ? task.title : '';
  document.getElementById('description').value = task ? task.description || '' : '';
  document.getElementById('deadline').value = task ? task.deadline || '' : '';
  document.getElementById('semester-select').value = task ? task.semester : semester;
  document.getElementById('form-error').textContent = '';
  updateCounts();
  dialog.showModal();
}

async function saveTask(event) {
  event.preventDefault();
  const data = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    deadline: document.getElementById('deadline').value || null,
    semester: Number(document.getElementById('semester-select').value)
  };
  const errorElement = document.getElementById('form-error');
  if (data.title.length < 1 || data.title.length > 128) {
    errorElement.textContent = 'Title must be between 1 and 128 characters';
    return;
  }
  if (data.description.length > 500) {
    errorElement.textContent = 'Description must be 500 characters or less';
    return;
  }
  if (data.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(data.deadline)) {
    errorElement.textContent = 'Enter a valid deadline';
    return;
  }
  if (![1, 2].includes(data.semester)) {
    errorElement.textContent = 'Choose a semester';
    return;
  }

  const url = editingId ? '/api/tasks/' + editingId : '/api/tasks';
  const method = editingId ? 'PUT' : 'POST';
  try {
    const response = await fetch(url, {
      method: method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
      errorElement.textContent = result.error;
      return;
    }
    dialog.close();
    loadTasks();
  } catch (error) {
    errorElement.textContent = 'Could not save task';
  }
}

async function changeStatus(task) {
  await fetch('/api/tasks/' + task.id + '/status', {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({completed: !task.completed})
  });
  loadTasks();
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await fetch('/api/tasks/' + id, {method: 'DELETE'});
  loadTasks();
}

document.getElementById('new-task').onclick = () => openForm();
document.querySelectorAll('.add-sem').forEach(button => {
  button.onclick = () => openForm(Number(button.dataset.semester));
});
document.getElementById('close-dialog').onclick = () => dialog.close();
document.getElementById('cancel-dialog').onclick = () => dialog.close();
document.getElementById('title').oninput = updateCounts;
document.getElementById('description').oninput = updateCounts;
form.onsubmit = saveTask;
loadTasks();
