const playerForm = document.getElementById("playerForm");
const playerTable = document.getElementById("playerTable");
const message = document.getElementById("message");
const emptyMessage = document.getElementById("emptyMessage");

let players = [];

try {
    const savedPlayers = JSON.parse(
        localStorage.getItem("basketballPlayers") || "[]"
    );

    if (Array.isArray(savedPlayers)) {
        players = savedPlayers.filter(player =>
            player &&
            typeof player.name === "string" &&
            Number.isInteger(player.jersey) &&
            typeof player.position === "string" &&
            Number.isInteger(player.points) &&
            Number.isInteger(player.assists) &&
            Number.isInteger(player.rebounds)
        );
    }
} catch (error) {
    players = [];
}

function savePlayers() {
    localStorage.setItem(
        "basketballPlayers",
        JSON.stringify(players)
    );
}

function showMessage(text) {
    message.textContent = text;
}

function updateDashboard() {
    document.getElementById("totalPlayers").textContent =
        players.length;

    document.getElementById("totalPoints").textContent =
        players.reduce((sum, player) => sum + player.points, 0);

    document.getElementById("totalAssists").textContent =
        players.reduce((sum, player) => sum + player.assists, 0);

    document.getElementById("totalRebounds").textContent =
        players.reduce((sum, player) => sum + player.rebounds, 0);
}

function renderPlayers() {
    playerTable.replaceChildren();

    emptyMessage.style.display =
        players.length === 0 ? "block" : "none";

    players.forEach(player => {
        const row = document.createElement("tr");

        const values = [
            player.name,
            player.jersey,
            player.position,
            player.points,
            player.assists,
            player.rebounds
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Stats";
        editButton.className = "edit-button";

        editButton.addEventListener("click", () => {
            updateStats(player.jersey);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {
            deletePlayer(player.jersey);
        });

        actions.append(editButton, deleteButton);
        row.appendChild(actions);

        playerTable.appendChild(row);
    });

    updateDashboard();
}

playerForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const jersey = Number(document.getElementById("jersey").value);
    const position = document.getElementById("position").value;

    if (!name || !Number.isInteger(jersey) ||
        jersey < 0 || jersey > 99) {
        showMessage("Enter a valid name and jersey number.");
        return;
    }

    const duplicate = players.some(
        player => player.jersey === jersey
    );

    if (duplicate) {
        showMessage("That jersey number is already in use.");
        return;
    }

    players.push({
        name: name,
        jersey: jersey,
        position: position,
        points: 0,
        assists: 0,
        rebounds: 0
    });

    savePlayers();
    renderPlayers();
    playerForm.reset();

    showMessage(name + " has been added successfully!");
});

function updateStats(jersey) {
    const player = players.find(
        player => player.jersey === jersey
    );

    if (!player) return;

    const points = prompt("Additional points scored:", "0");
    if (points === null) return;

    const assists = prompt("Additional assists:", "0");
    if (assists === null) return;

    const rebounds = prompt("Additional rebounds:", "0");
    if (rebounds === null) return;

    const stats = [points, assists, rebounds].map(value =>
        value.trim() === "" ? NaN : Number(value)
    );

    if (stats.some(value =>
        !Number.isSafeInteger(value) || value < 0
    )) {
        showMessage("Enter valid non-negative whole numbers.");
        return;
    }

    const [p, a, r] = stats;

    if (
        !Number.isSafeInteger(player.points + p) ||
        !Number.isSafeInteger(player.assists + a) ||
        !Number.isSafeInteger(player.rebounds + r)
    ) {
        showMessage("Those statistics are too large.");
        return;
    }

    player.points += p;
    player.assists += a;
    player.rebounds += r;

    savePlayers();
    renderPlayers();

    showMessage("Statistics updated successfully!");
}

function deletePlayer(jersey) {
    const player = players.find(
        player => player.jersey === jersey
    );

    if (!player) return;

    if (!confirm("Remove " + player.name + " from the team?")) {
        return;
    }

    players = players.filter(
        player => player.jersey !== jersey
    );

    savePlayers();
    renderPlayers();

    showMessage("Player removed successfully.");
}

renderPlayers();
