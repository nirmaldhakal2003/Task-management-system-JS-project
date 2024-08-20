document.addEventListener("DOMContentLoaded",function(){
    const taskForm = document.getElementById("taskForm")
    const taskContainer = document.getElementById("taskContainer")
    const searchInput = document.getElementById("search")

    let tasks = []
    function loadTasks(){
        const storedTasks = loacalStorage.getItem("tasks")
        if(storedTasks){
            tasks = JSON.parse(storedTasks)
        }
    }

    function saveTasks(){
        localStorage.setItem("tasks", JSON.stringify(tasks))
    }


    function renderTasks(){
        taskContainer.innerHTML = " "
        const filteredTasks = tasks.filter(task =>{
            return task.title.toLowerCase() .includes(searchInput.value.toLowerCase()) ||
            task.description.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            task.category.toLowerCase().includes(searchInput.value.toLowerCase())

        })


        filteredTasks.forEach(task => {
            const taskElement = document.createElement("div")
            taskElement.className = `task-item' $ {task.completed ? "completed" : ""}`
            taskElement.innerHTML = "<hr>"

            taskElement.innerHTML = `
            <h3> ${task.title}</h3>
            <p> ${task.description}</P>
            <p> Deadline : ${task.deadline}</P>
            <p> Priority : ${task.priority}</P>
            <p> Category : ${task.category}</P>
            <button onClick = "toggleComplete(${task.id})"> ${task.completed ? "Undo" : "Complete"}</button>
            <button onClick = "editTask(${task.id})"> Edit</button>
            <button onClick = "deleteTask(${task.id})"> Delete</button>
            <hr>
            `

            taskContainer.appendChild(taskElement)
        })
    }


    taskForm.addEventListener("submit", function(event){
        event.preventDefault()

        const title = document.getElementById("title").value
        const description = document.getElementById("description").value
        const deadline= document.getElementById("deadline").value
        const priority = document.getElementById("priority").value
        const category = document.getElementById("category").value

        const taskId = taskForm.dataset.editingId
        if(taskId) {
            const taskIndex = tasks.findIndex(task => task.id === Number(taskId))
            tasks[taskIndex] = {
                id : Number(taskId),
                title,
                description,
                deadline,
                priority,
                category,
                completed : tasks[taskIndex].completed
            }
            
            delete taskForm.dataset.editingId
        }
        else{
            const task =  {
            id : Date.now(),
            title,
            description,
            deadline,
            priority,
            category,
            completed : false
            }
            tasks.push(task)
        }

        saveTasks()
        renderTasks()
        taskForm.reset()
    })


    window.toggleComplete = function(id){
        const task = tasks.find(t => t.id ===id)
        task.completed = !task.completed
        saveTasks()
        renderTasks()
    }

    window.editTask = function(id) {
        const  task = tasks.find(t => t.id === id)
        document.getElementById("title").value = task.title
        document.getElementById("description").value = task.description
        document.getElementById("deadline").value = task.deadline
        document.getElementById("priority").value = task.priority
        document.getElementById("category").value = task.category

        taskForm.dataset.editingId = id

        
    }

    window.deleteTask = function(id){
        tasks = tasks.filter(t => t.id !== id)
        saveTasks()
        renderTasks()
    }

    searchInput.addEventListener("input",renderTasks)
    loadTasks()
    renderTasks()
})


// Checking for deadline
function checkDeadlines() {
    const currentTime = new Date().getTime();
    
    tasks.forEach(task => {
        const deadlineTime = new Date(task.deadline).getTime();
        const timeDifference = deadlineTime - currentTime;

        
        if (timeDifference > 0 && timeDifference <= 86400000 && !task.notified) {
            if (Notification.permission === "granted") {
                new Notification(`Reminder: Task "${task.title}" is due soon!`, {
                    body: `Deadline: ${task.deadline}\nPriority: ${task.priority}`,
                    icon: "path-to-icon/icon.png" 
                });
                task.notified = true; 
                saveTasks();
            }
        }
    });
}


if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

setInterval(checkDeadlines, 3600000); 

