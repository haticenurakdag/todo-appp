document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.querySelector(".add");
  addButton.addEventListener("click", createTodo);

  function taskNerde(task, taskId) {
    const taskList = document.querySelector("#tasklist");
    const tr = document.createElement("tr");

    // Checkbox hücresi
    const checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.classList.add("new-checkbox");
    const checkbox = document.createElement("td");
    checkbox.appendChild(checkboxInput);
    tr.appendChild(checkbox);

    //Name hücresi
    const name = document.createElement("td");
    name.classList.add("new-name");
    name.textContent = task.content;
    tr.appendChild(name);

    //Description hücresi
    const description = document.createElement("td");
    description.classList.add("new-description");
    description.textContent = task.description;
    tr.appendChild(description);

    //////////////////////////////////////////////////////////////////
    // Status hücresi
    const statusCell = document.createElement("td");
    const pendingSpan = document.createElement("span");
    pendingSpan.classList.add("pending");
    pendingSpan.textContent = "pending";
    statusCell.appendChild(pendingSpan);
    tr.appendChild(statusCell);

    // Status hücresine tıklanınca durumu değiştir
    pendingSpan.addEventListener("click", function () {
      const newStatus = !task.status; //createtodo içindeki durumu tersine çevirmke için
      updateStatus(taskId, newStatus); // APIde güncellensin diye fonk cagırıyoruz
      task.status = newStatus; // tekrar bastığımda eski haline gelsin diye
      if (newStatus == true) {
        pendingSpan.textContent = "completed";
        pendingSpan.style.backgroundColor = "green";
        name.style.textDecoration = "line-through";
        description.style.textDecoration = "line-through";
        tr.style.backgroundColor = "#f0f0f0";
      } else {
        pendingSpan.textContent = "pending";
        pendingSpan.style.backgroundColor = "red";
        name.style.textDecoration = "none";
        description.style.textDecoration = "none";
        tr.style.backgroundColor = "white";
      }
      saveTasksToLocalStorage();
    });
    //status apıye ekleme
    function updateStatus(taskId, newStatus) {
      fetch(`https://64d214b4f8d60b1743616a73.mockapi.io/todo/${taskId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("HTTP error " + res.status);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
    //////////////////////////////////////////////////////////////////

    // DELETE VE EDİT HÜCRESİ
    const actionCell = document.createElement("td");
    const editSpan = document.createElement("span");
    editSpan.textContent = "Edit";
    editSpan.classList.add("edit");
    const deleteSpan = document.createElement("span");
    deleteSpan.textContent = "Delete";
    deleteSpan.classList.add("delete");
    actionCell.appendChild(editSpan);
    actionCell.appendChild(deleteSpan);
    tr.appendChild(actionCell);

    //SİLME İSTEĞİ İÇİN

    function Delete(taskId) {
      fetch(`https://64d214b4f8d60b1743616a73.mockapi.io/todo/${taskId}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (res.ok) {
            console.log("Task is deleted.");
            const taskRow = document.querySelector(
              `[data-task-id="${taskId}"]`
            ); //direkt hücreden  de sillinsi diye
            if (taskRow) {
              taskRow.remove();
            }
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }

    deleteSpan.setAttribute("data-task-id", taskId);
    deleteSpan.addEventListener("click", function () {
      const taskIdToDelete = deleteSpan.getAttribute("data-task-id");
      Delete(taskIdToDelete);

      taskList.removeChild(tr); //işlem yapılınca direkt hücreden gitsin diye yenilenmeden
    });

    //////////////////////////////////////////////////////////////////////////////

    //EDİT İŞLEMİNDE HÜCREYE İNPUT ELEMENTİ EKLEMEK İÇİN
    function EditCell(tdElement) {
      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("edit-input");

      input.value = tdElement.textContent;
      tdElement.textContent = ""; //içeriğin yerine input koyuyor olmazsa içerik kalır alta yeni bir input açar
      tdElement.appendChild(input);

      return input;
    }

    //EDİT FONKSİYONUNU KULLANMAK İÇİN PUT İSTEĞİ

    function Edit(taskId, tr) {
      const nameCell = tr.querySelector(".new-name"); //edit yapılcak yerin ücresini seçti
      const descriptionCell = tr.querySelector(".new-description");

      const nameInput = EditCell(nameCell); //bunlar editcell fonksiyonunda oluşturlan inputu hücrelere ayırıd
      const descriptionInput = EditCell(descriptionCell);

      const editButton = tr.querySelector(".edit"); // Edit butonunu save ile değiştirmek için kullandık
      editButton.textContent = "Save";

      function handleSaveClick() {
        const updatedTitle = nameInput.value;
        const updatedDescription = descriptionInput.value;

        const updateTaskData = {
          content: updatedTitle,
          description: updatedDescription,
        };

        fetch(`https://64d214b4f8d60b1743616a73.mockapi.io/todo/${taskId}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(updateTaskData),
        })
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
          })
          .then((updatedTask) => {
            console.log("Task updated:", updatedTask);

            nameCell.textContent = updatedTitle;
            descriptionCell.textContent = updatedDescription;
            editButton.textContent = "Edit";
            editButton.removeEventListener("click", handleSaveClick);
            editButton.addEventListener("click", handleEditClick);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }

      function handleEditClick() {
        editButton.removeEventListener("click", handleEditClick);
        editButton.addEventListener("click", handleSaveClick);
      }

      editButton.removeEventListener("click", handleEditClick); //edit butonundan tıklama olayını kaldıır
      editButton.addEventListener("click", handleSaveClick); //save butonuna tıklama olayı ekler
    }

    //editleme işlemi için kullanılacak
    editSpan.setAttribute("data-task-id", taskId);
    editSpan.addEventListener("click", function () {
      const taskIdToEdit = editSpan.getAttribute("data-task-id");
      Edit(taskIdToEdit, tr);
    });

    taskList.appendChild(tr);
  }

  /////////////////////////////////////////////////////////////////////////////

  //GÖREVLERİ SAYFAYA GETİRMEK İÇİN POST İSTEĞİ ATTIM

  function createTodo() {
    const todoTitle = document.querySelector(".todoTitle");
    const description = document.querySelector(".description");

    if (todoTitle.value.trim() === "") {
      //boş eklemeyi kaldırdım
      console.log("Görev boş bırakılamaz.");
      alert("lütfen alanı doldurunuz");
      return;
    }

    const newTask = {
      content: todoTitle.value,
      description: description.value,
      status: false,
    };

    fetch("https://64d214b4f8d60b1743616a73.mockapi.io/todo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((task) => {
        console.log("New task added:", task);
        taskNerde(task);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    todoTitle.value = "";
    description.value = "";
  }
  ////////////////////////////////////////////////////////////////////////////////
  function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      tasks.forEach((task) => {
        taskNerde(task);
      });
    }
  }

  function loadTaskStatusFromLocalStorage() {
    const savedTaskStatus = localStorage.getItem("taskStatus");
    if (savedTaskStatus) {
      const taskStatus = JSON.parse(savedTaskStatus);
      const pendingSpans = document.querySelectorAll(".pending");
      pendingSpans.forEach((pendingSpan, index) => {
        if (taskStatus[index]) {
          completeTaskUI(pendingSpan);
        }
      });
    }
  }

  function completeTaskUI(pendingSpan) {
    pendingSpan.textContent = "completed";
    pendingSpan.style.backgroundColor = "green";
    const tr = pendingSpan.parentElement.parentElement;
    const nameCell = tr.querySelector(".new-name");
    const descriptionCell = tr.querySelector(".new-description");
    nameCell.style.textDecoration = "line-through";
    descriptionCell.style.textDecoration = "line-through";
    tr.style.backgroundColor = "#f0f0f0";
  }

  loadTasksFromLocalStorage();
  loadTaskStatusFromLocalStorage();

  function saveTasksToLocalStorage() {
    const tasks = Array.from(document.querySelectorAll(".new-name")).map(
      (nameCell) => {
        const tr = nameCell.parentElement;
        return {
          content: nameCell.textContent,
          description: tr.querySelector(".new-description").textContent,
        };
      }
    );
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function saveTaskStatusToLocalStorage() {
    const pendingSpans = document.querySelectorAll(".pending");
    const taskStatus = Array.from(pendingSpans).map(
      (pendingSpan) => pendingSpan.textContent === "completed"
    );
    localStorage.setItem("taskStatus", JSON.stringify(taskStatus));
  }

  window.addEventListener("beforeunload", () => {
    saveTasksToLocalStorage();
    saveTaskStatusToLocalStorage();
  });
});
