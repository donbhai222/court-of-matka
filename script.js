// ================= CONFIG =================
const SHEET_ID = '1IReRyQjRvWWVjZTym_8DDXvx9Jttjfgy18McY53gM5w';
const SHEET_NAME = 'Sheet1';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

// ================= LOAD =================
async function loadChart() {
    try {
        const res = await fetch(CSV_URL + '&cache=' + Date.now());
        const data = await res.text();
        const rows = parseCSV(data);
        if (rows.length < 2) {
            document.getElementById('chartBody').innerHTML = '<tr><td colspan="7" class="loading">No data</td></tr>';
            return;
        }
        renderChart(rows);
    } catch (err) {
        console.error(err);
        document.getElementById('chartBody').innerHTML = '<tr><td colspan="7" class="loading">Error loading chart</td></tr>';
    }
}

// ================= PARSE CSV =================
function parseCSV(text) {
    const lines = text.trim().split('\n');
    return lines.map(line => {
        const cells = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') inQuotes = !inQuotes;
            else if (c === ',' && !inQuotes) { cells.push(current.trim()); current = ''; }
            else current += c;
        }
        cells.push(current.trim());
        return cells;
    });
}

// ================= RENDER =================
function renderChart(rows) {
    const tbody = document.getElementById('chartBody');
    tbody.innerHTML = '';

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0] || row[0].trim() === '') continue;

        const tr = document.createElement('tr');

        // Date cell
        const dateTd = document.createElement('td');
        dateTd.className = 'date-box';
        const dateText = row[0].trim();
        if (dateText.toLowerCase().includes(' to ')) {
            const parts = dateText.split(/ to /i).map(s => s.trim());
            dateTd.innerHTML = `<div class="d1">${parts[0]}</div><div class="to">to</div><div class="d2">${parts[1]}</div>`;
        } else {
            dateTd.innerHTML = `<div class="d1">${dateText}</div>`;
        }
        tr.appendChild(dateTd);

        // 6 days
        for (let j = 1; j <= 6; j++) {
            const td = document.createElement('td');
            const val = (row[j] || '').trim();

            if (!val || val === '🔒' || val.toUpperCase() === 'LOCKED') {
                td.className = 'lock-cell';
                td.innerHTML = `<div class="lock-btn">🔒</div>`;
                td.onclick = () => location.href = 'subscription.html';
            } else if (val.includes('-')) {
                const parts = val.split('-');
                if (parts.length === 3) {
                    const [left, jodi, right] = parts.map(p => p.trim());
                    const isRed = jodi.length === 2 && (jodi[0] === jodi[1] || Math.abs(jodi[0] - jodi[1]) === 5);
                    if (isRed) td.classList.add('red-house');
                    td.innerHTML = `<div class="cell-content">
                        <div class="panna">${left.split('').map(n => `<span>${n}</span>`).join('')}</div>
                        <div class="jodi">${jodi}</div>
                        <div class="panna">${right.split('').map(n => `<span>${n}</span>`).join('')}</div>
                    </div>`;
                } else {
                    td.innerHTML = `<div class="cell-content"><div class="jodi">${val}</div></div>`;
                }
            } else {
                td.innerHTML = `<div class="cell-content"><div class="jodi">${val}</div></div>`;
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    if (tbody.children.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No data</td></tr>';
    }
}

// Auto-refresh
setInterval(loadChart, 30000);

// Play game button
function playGame() {
    alert('🎮 Game section coming soon!\n\nStay tuned...');
}

// Init
window.addEventListener('load', loadChart);
