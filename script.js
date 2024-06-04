const currentMonthElement = document.getElementById('currentMonth');
const calendarBody = document.querySelector('#calendar tbody');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const yearSelect = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const goToDateBtn = document.getElementById('goToDateBtn');
const shiftButtons = document.querySelectorAll('.shiftBtn');
const totalHoursElement = document.getElementById('totalHours');
const totalSalaryElement = document.getElementById('totalSalary');

const holidays = {
    "2024-01-01": "元日",
    "2024-01-08": "成人の日",
    "2024-02-11": "建国記念の日",
    "2024-02-12": "建国記念の日 振替休日",
    "2024-03-20": "春分の日",
    "2024-04-29": "昭和の日",
    "2024-05-03": "憲法記念日",
    "2024-05-04": "みどりの日",
    "2024-05-05": "こどもの日",
    "2024-05-06": "こどもの日 振替休日",
    "2024-07-15": "海の日",
    "2024-08-11": "山の日",
    "2024-08-12": "山の日 振替休日",
    "2024-09-16": "敬老の日",
    "2024-09-23": "秋分の日",
    "2024-10-14": "体育の日",
    "2024-11-03": "文化の日",
    "2024-11-04": "文化の日 振替休日",
    "2024-11-23": "勤労感謝の日",
    "2024-12-23": "天皇誕生日"
};

const shiftDurations = {
    "17:30-21:00": 3.5,
 "18:00-21:00": 3,
    "16:00-21:00": 5,
    "12:00-21:00": 9 // 本来の勤務時間を設定
};

let currentDate = new Date();
let shiftMode = false;
let selectedShiftTime = null;
let shifts = JSON.parse(localStorage.getItem('shifts')) || {};

function renderCalendar(date) {
    calendarBody.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();

    currentMonthElement.textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let row = document.createElement('tr');

    for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement('td'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('td');
        cell.textContent = day;
        const cellDate = new Date(year, month, day);
        const formattedDate = formatDate(cellDate);

        if (cellDate.getDay() === 6) { // 土曜日の場合
            cell.classList.add('saturday');
        } else if (cellDate.getDay() === 0 || holidays[formattedDate]) { // 日曜日または祝日の場合
            cell.classList.add('sunday');
        }

        if (holidays[formattedDate]) {
            const holidayText = document.createElement('div');
            holidayText.textContent = holidays[formattedDate];
            holidayText.classList.add('holiday-text');
            cell.appendChild(holidayText);
        }

        if (shifts[formattedDate]) {
            const shiftText = document.createElement('div');
            shiftText.textContent = shifts[formattedDate];
            shiftText.classList.add('shift-time');
            cell.appendChild(shiftText);
        }

        cell.addEventListener('click', () => {
            if (shiftMode && selectedShiftTime) {
                if (shifts[formattedDate]) {
                    delete shifts[formattedDate];
                    if (cell.querySelector('.shift-time')) {
                        cell.removeChild(cell.querySelector('.shift-time'));
                    }
                } else {
                    shifts[formattedDate] = selectedShiftTime;
                    const shiftText = document.createElement('div');
                    shiftText.textContent = selectedShiftTime;
                    shiftText.classList.add('shift-time');
                    cell.appendChild(shiftText);
                }
                localStorage.setItem('shifts', JSON.stringify(shifts));
                updateWorkSummary();
            }
        });

        row.appendChild(cell);

        if ((cellDate.getDay() + 1) % 7 === 0) { // 日曜日の場合
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }
    }

    if (row.children.length > 0) {
        calendarBody.appendChild(row);
    }

    updateWorkSummary();
}

function updateWorkSummary() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    let totalHours = 0;

    for (const [date, shift] of Object.entries(shifts)) {
        const [shiftYear, shiftMonth] = date.split('-').map(Number);
        if (shiftYear === year && shiftMonth === month) {
            let shiftDuration = shiftDurations[shift];
            if (shiftDuration > 6) {
                shiftDuration -= 1; // 6時間を超える場合、1時間の休憩を引く
            }
            totalHours += shiftDuration;
        }
    }

    const totalSalary = totalHours * 1000;

    totalHoursElement.textContent = `今月の合計勤務時間: ${totalHours} 時間`;
    totalSalaryElement.textContent = `今月の給料: ${totalSalary} 円`;
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function populateYearSelect() {
    const currentYear = currentDate.getFullYear();
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
}

function populateMonthSelect() {
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month - 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    }
    monthSelect.value = currentDate.getMonth();
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

goToDateBtn.addEventListener('click', () => {
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    currentDate = new Date(year, month);
    renderCalendar(currentDate);
});

shiftButtons.forEach(button => {
    button.addEventListener('click', () => {
        shiftButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        shiftMode = true;
        selectedShiftTime = button.dataset.shiftTime;
    });
});

populateYearSelect();
populateMonthSelect();
renderCalendar(currentDate);

