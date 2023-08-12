function generateUniqueId() {
  return new Date().getTime().toString(); 
}
const addButton = document.querySelector(".create-todo");
addButton.addEventListener("click", createTodo);

async function createTodo() {
  const taskId = generateUniqueId(); 

  const görevYazInput = document.querySelector(".görevYaz");
  const görevYaz = görevYazInput.value;

  if (görevYaz.trim() === "") {
    alert("lütfen alanı doldurunuz");
    return;
  }

  const taskList = document.querySelector(".task-list tbody");
  const tr = document.createElement("tr");
  tr.classList.add("tr");

  tr.setAttribute("data-id", taskId); 

  const checkboxCell = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkboxCell.classList.add("checkboxCell");
  ///////////////////////////////////////////////////////7
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      task.style.textDecoration = "line-through";
      tr.style.backgroundColor = "#f0f0f0";
    } else {
      task.style.textDecoration = "none";
      tr.style.backgroundColor = "white"; 
    }
  });
  /////////////////////////////////////////////////////////////////
  const task = document.createElement("td");
  task.textContent = görevYaz;
  task.classList.add("task");

  const edit = document.createElement("td");
  edit.textContent = "Edit";
  edit.classList.add("edit");
  edit.addEventListener("click", editButton);

  const delet = document.createElement("td");
  delet.textContent = "Delete";
  delet.classList.add("delete");
  delet.addEventListener("click", deleteButton);

  taskList.appendChild(tr);
  tr.appendChild(checkboxCell);
  checkboxCell.appendChild(checkbox);
  tr.appendChild(task);
  tr.appendChild(edit);
  tr.appendChild(delet);

  görevYazInput.value = "";
  try {
    await postMethod(görevYaz);
  } catch (error) {
    console.log(error);
  }
}
function deleteButton(event) {
  const row = event.target.parentNode;

  row.parentNode.removeChild(row);
}

async function editButton(event) {
  const row = event.target.parentNode; 
  const taskCell = row.querySelector(".task");
  const taskId = row.getAttribute("data-id");

  // inputu oluşturmak için
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = taskCell.textContent;

  // Input alanınını hücreye yerleştirsin
  taskCell.textContent = "";
  taskCell.appendChild(editInput);

  // Inputtan çıkınca direkt kaydetsin diye
  editInput.addEventListener("blur", async () => {
    const updatedTask = editInput.value;
    taskCell.textContent = updatedTask;

    try {
      await putMethod(taskId, updatedTask);
    } catch (error) {
      console.log(error);
    }
  });
  editInput.focus();
}
/////////////////////////////////////////////////////////////////
const postMethod = async (görevYaz) => {
  try {
    const res = await fetch(
      "https://64d214b4f8d60b1743616a73.mockapi.io/todo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: görevYaz }),
      }
    );
    const data = await res.json();

    if (!res.ok) {
      console.log("proplem");
      return;
    }

    console.log(data);
  } catch (error) {
    console.log(error);
  }
};
//////////////////////////////////////////////////////////////////
const putMethod = async (taskId, updatedTask) => {
  try {
    const res = await fetch(
      `https://64d214b4f8d60b1743616a73.mockapi.io/todo/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: updatedTask }),
      }
    );
    const data = await res.json();

    if (!res.ok) {
      console.log("proplem");
      return;
    }

    console.log(data);
  } catch (error) {
    console.log(error);
  }
};
