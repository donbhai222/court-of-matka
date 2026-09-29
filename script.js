// ================= CONFIG =================
const SHEET_ID = '1IReRyQjRvWWVjZTym_8DDXvx9Jttjfgy18McY53gM5w';
const SHEET_NAME = 'Sheet1';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

const ROWS_PER_LOAD = 8;
let allRows = [];
let shownRows = 0;

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

        allRows = rows.slice(1).filter(r => r[0] && r[0].trim() !== '');
        shownRows = 0;
        document.getElementById('chartBody').innerHTML = '';
        showMore(true);
    } catch (err) {
        console.error(err);
        document.getElementById('chartBody').innerHTML = '<tr><td colspan="7" class="loading">Error loading chart</td></tr>';
    }
}

// ================= SHOW MORE =================
function showMore(firstLoad) {
    const tbody = document.getElementById('chartBody');
    const end = Math.min(shownRows + ROWS_PER_LOAD, allRows.length);

    for (let i = shownRows; i < end; i++) {
        tbody.appendChild(buildRow(allRows[i], i === allRows.length - 1));
    }
    shownRows = end;

    const btn = document.getElementById('showMoreBtn');
    if (shownRows >= allRows.length) {
        btn.style.display = 'none';
    } else {
        btn.style.display = 'inline-block';
        btn.innerText = '▼ SHOW MORE (' + (allRows.length - shownRows) + ') ▼';
    }
}

// ================= BUILD ROW =================
function buildRow(row, isLastDataRow) {
    const tr = document.createElement('tr');

    // DATE
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

    // 6 days - find first empty cell for this row
    let lockPlaced = false;
    for (let j = 1; j <= 6; j++) {
        const td = document.createElement('td');
        const val = (row[j] || '').trim();

        if (!val || val === '🔒' || val.toUpperCase() === 'LOCKED') {
            if (!lockPlaced) {
                // 🔒 SIRF PEHLA EMPTY CELL ME LOCK
                td.className = 'lock-cell';
                td.innerHTML = `<div class="lock-btn">🔒</div>`;
                td.onclick = () => location.href = 'subscription.html';
                lockPlaced = true;
            }
            // Baaki empty cells khaali
        } else if (val.includes('-')) {
            const parts = val.split('-');
            if (parts.length === 3) {
                const [left, jodi, right] = parts.map(p => p.trim());
                const isRed = jodi.length === 2 && (jodi[0] === jodi[1] || Math.abs(jodi[0] - jodi[1]) === 5);
                if (isRed) td.classList.add('red-house');

                // Determine neon color for jodi
                let neonClass = '';
                if (isRed) neonClass = 'red-neon';
                else {
                    const jn = parseInt(jodi);
                    if (jn % 3 === 0) neonClass = 'green-neon';
                }

                td.innerHTML = `<div class="cell-content">
                    <div class="panna">${left.split('').map(n => `<span>${n}</span>`).join('')}</div>
                    <div class="jodi ${neonClass}">${jodi}</div>
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
    return tr;
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

// ================= PLAY GAME =================
function playGame() {
    alert('🎮 Game section coming soon!');
}

// ================= AUTO REFRESH =================
setInterval(loadChart, 30000);

// ================= INIT =================
window.addEventListener('load', loadChart);
