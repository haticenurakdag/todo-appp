async function getTasks() {
  try {
    const res = await fetch("https://64d214b4f8d60b1743616a73.mockapi.io/todo");
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function displayTasks() {
  const tasks = await getTasks();
  const ul = document.querySelector("ul");
  ul.innerHTML = "";
  const addButton = document.querySelector(".create-todo");
  addButton.addEventListener("click", newElement);

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "li";
    const taskBox = document.createElement("div");
    taskBox.className = "task-box";
    taskBox.textContent = task.todo;
    li.appendChild(taskBox);
    const butonContainer = document.createElement("div");
    butonContainer.className = "buton-container";
    li.appendChild(butonContainer);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    butonContainer.appendChild(checkbox);

    checkbox.addEventListener("change", async function () {
      if (checkbox.checked) {
        taskBox.style.textDecoration = "line-through";
        li.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      } else {
        taskBox.style.textDecoration = "none";
        li.style.backgroundColor = "transparent";
      }

      try {
        await fetch(
          `https://64d214b4f8d60b1743616a73.mockapi.io/todo/${task.id}`,
          {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ completed: checkbox.checked }),
          }
        );
      } catch (error) {
        console.error("Error updating checkbox status:", error);
      }
    });

    if (task.completed) {
      checkbox.checked = true;
      taskBox.style.textDecoration = "line-through";
      li.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    }

    const edit = document.createElement("span");
    edit.textContent = "EDİT";
    edit.className = "edit";
    butonContainer.appendChild(edit);

    const delet = document.createElement("span");
    delet.textContent = "DELETE";
    delet.className = "delete";
    butonContainer.appendChild(delet);

    li.setAttribute("data-task-id", task.id);
    const taskId = li.getAttribute("data-task-id");
    ul.appendChild(li);

    delet.onclick = function () {
      deleteTask(taskId);
      ul.removeChild(li);
    };
    edit.onclick = function (event) {
      event.target.closest("li");
      editTask(event, taskId);
    };
  });
}

async function newElement() {
  const inputValue = document.querySelector(".görevYaz").value;

  if (inputValue.trim() === "") {
    alert("Lütfen alanı doldurunuz");
    return;
  }

  try {
    const res = await fetch(
      "https://64d214b4f8d60b1743616a73.mockapi.io/todo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ todo: inputValue }),
      }
    );
    const data = await res.json();

    console.log("Task added:", data);
    document.querySelector(".görevYaz").value = "";
    displayTasks();
  } catch (error) {
    console.log(error);
  }
}

async function deleteTask(taskId) {
  try {
    const res = await fetch(
      `https://64d214b4f8d60b1743616a73.mockapi.io/todo/${taskId}`,
      {
        method: "DELETE",
      }
    );
    const deletedTask = await res.json();
    console.log("Task deleted:", deletedTask);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function editTask(event, taskId) {
  const li = event.target.closest("li");
  const taskBox = li.querySelector(".task-box");
  const originalTask = taskBox.textContent;

  const editInput = document.createElement("input");
  editInput.className = "edit-input";
  editInput.type = "text";
  editInput.value = originalTask;

  taskBox.textContent = "";
  taskBox.appendChild(editInput);

  editInput.addEventListener("blur", async () => {
    const updatedTask = editInput.value;
    taskBox.textContent = updatedTask;
    if (updatedTask !== originalTask) {
      try {
        const res = await fetch(
          `https://64d214b4f8d60b1743616a73.mockapi.io/todo/${taskId}`,
          {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ todo: updatedTask }),
          }
        );

        if (res.ok) {
          const updatedData = await res.json();
          console.log("Task updated:", updatedData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  });

  editInput.focus();
}

document.addEventListener("DOMContentLoaded", function () {
  displayTasks();
});
