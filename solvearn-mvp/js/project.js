document.getElementById("create-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const name = document.getElementById("project-name").value;
    const desc = document.getElementById("project-desc").value;
    const roles = document.getElementById("project-roles").value;
  
    const card = document.createElement("div");
    card.innerHTML = `<h3>${name}</h3><p>${desc}</p><p>Roles: ${roles}</p>`;
    document.getElementById("project-list").appendChild(card);
  
    // Clear form
    this.reset();
  });
  