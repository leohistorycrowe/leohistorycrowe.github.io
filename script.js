const surplusCtx = document.getElementById('surplusChart').getContext('2d');
const surplusChart = new Chart(surplusCtx, {
  type: 'bar',
  data: {
    labels: ['Outcome'],
    datasets: [
      {
        label: 'Donuts Sold',
        data: [0],
        backgroundColor: 'steelblue',
      },
      {
        label: 'Wasted Donuts',
        data: [0],
        backgroundColor: 'tomato',
      },
      {
        label: 'Missed Customers',
        data: [0],
        backgroundColor: 'goldenrod',
      }
    ]
  },
  options: {
    responsive: false,
    indexAxis: 'y',
    scales: {
      x: {
        title: {
          display: true,
          text: 'Quantity'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.raw}`
        }
      }
    }
  }
});

let weather = "sunny";
const weatherEffects = { sunny: 1.2, rainy: 0.8 };

function getRandomWeather() {
  return Math.random() < 0.5 ? "sunny" : "rainy";
}

function applyWeatherEffect() {
  weather = getRandomWeather();
  const factor = weatherEffects[weather];
  adjustedDemandIntercept = demandIntercept * factor;
  const eqX = (adjustedDemandIntercept - supplyIntercept) / (supplySlope - demandSlope);
  const eqY = demandSlope * eqX + adjustedDemandIntercept;
  optimalQty = Math.floor(eqX + 0.5);
  equilibrium = (eqX >= 0 && eqY >= 0) ? { x: eqX, y: eqY } : null;
  document.getElementById("debug-info").innerText =
    `Equilibrium Quantity: ${equilibrium ? '~' + optimalQty : "N/A"}\n` +
    `Demand Curve: price = ${demandSlope.toFixed(3)} * quantity + ${adjustedDemandIntercept.toFixed(2)}\n` +
    `Supply Curve: price = ${supplySlope.toFixed(3)} * quantity + ${supplyIntercept.toFixed(2)}`;

  const weatherLabel = document.getElementById("weather");
  const weatherImage = document.getElementById("weather-image");
  const weatherEffectText = document.getElementById("weather-effect");
  if (weather === "sunny") {
    weatherLabel.innerText = "Sunny ☀️ (More customers expected!)";
    weatherImage.src = "images/sunny.png";
    weatherEffectText.innerText = "On sunny days, more people go out. Demand increases and the entire demand curve shifts right.";
  } else {
    weatherLabel.innerText = "Rainy ☔️ (Fewer customers expected)";
    weatherImage.src = "images/rainy.png";
    weatherEffectText.innerText = "Rainy days reduce foot traffic. Demand decreases and the demand curve shifts left.";
  }
}

document.getElementById('quantity').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') testQuantity();
});

let day = 1;
let gameOver = false;

const demandSlope = -Math.random() * 0.1 - 0.05;
const demandIntercept = Math.random() * 5 + 5;
const supplySlope = Math.random() * 0.1 + 0.05;
const supplyIntercept = Math.random() * 2;

const demandCurve = [];
const supplyCurve = [];
let equilibrium = null;
let optimalQty = 0;

for (let q = 0; q <= 150; q++) {
  supplyCurve.push({ x: q, y: supplySlope * q + supplyIntercept });
}

const ctx = document.getElementById('gameChart').getContext('2d');
const gameChart = new Chart(ctx, {
  type: 'scatter',
  data: {
    datasets: [
      { label: 'Supply at Your Qty', data: [], backgroundColor: 'green', borderColor: 'green', pointRadius: 5, showLine: false },
      { label: 'Demand at Your Qty', data: [], backgroundColor: 'blue', borderColor: 'blue', pointRadius: 5, showLine: false },
      { label: 'Supply Curve (full)', data: [], borderColor: 'lightgreen', pointRadius: 0, showLine: true, borderDash: [5, 5] },
      { label: 'Demand Curve (full)', data: [], borderColor: 'lightblue', pointRadius: 0, showLine: true, borderDash: [5, 5] },
      { label: 'Equilibrium Point', data: [], backgroundColor: 'gold', borderColor: 'gold', pointRadius: 10, pointStyle: 'star', showLine: false }
    ]
  },
  options: {
    responsive: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: (${ctx.raw.x.toFixed(2)}, $${ctx.raw.y.toFixed(2)})`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Quantity (Donuts)' }, min: 0, max: 100 },
      y: { title: { display: true, text: 'Price ($)' }, min: 0, max: 10 }
    }
  }
});

function calculateDemand(qty) {
  return demandSlope * qty + adjustedDemandIntercept;
}

let adjustedDemandIntercept = demandIntercept;
applyWeatherEffect();

function updateChartBounds() {
  const chartOptions = gameChart.options.scales;
  let eqVisible = true;
  if (equilibrium) {
    const bufferX = 5;
    const bufferY = 1;
    const xMin = chartOptions.x.min;
    const xMax = chartOptions.x.max;
    const yMin = chartOptions.y.min;
    const yMax = chartOptions.y.max;
    if (
      equilibrium.x < xMin + bufferX ||
      equilibrium.x > xMax - bufferX ||
      equilibrium.y < yMin + bufferY ||
      equilibrium.y > yMax - bufferY
    ) {
      eqVisible = false;
    }
  }
  if (!equilibrium || !eqVisible) {
    const allPoints = [];
    gameChart.data.datasets.forEach(dataset => {
      if (dataset.data && dataset.data.length > 0) allPoints.push(...dataset.data);
    });
    if (allPoints.length === 0) return;
    const allX = allPoints.map(p => p.x);
    const allY = allPoints.map(p => p.y);
    chartOptions.x.min = Math.max(0, Math.min(...allX) - 5);
    chartOptions.x.max = Math.max(...allX) + 10;
    chartOptions.y.min = Math.max(0, Math.min(...allY) - 1);
    chartOptions.y.max = Math.max(...allY) + 5;
  }
  gameChart.update();
}

function testQuantity() {
  if (gameOver) return;
  const qty = Number(document.getElementById('quantity').value);
  if (isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
    alert("Please enter a valid, non-negative whole number of donuts.");
    return;
  }
  const demandPrice = calculateDemand(qty);
  const supplyPrice = supplySlope * qty + supplyIntercept;
  gameChart.data.datasets[0].data.push({ x: qty, y: supplyPrice });
  gameChart.data.datasets[1].data.push({ x: qty, y: demandPrice });

  let hint = qty === optimalQty
    ? `🎯 Perfect! You found the ideal quantity in ${day} day${day > 1 ? 's' : ''}!`
    : qty > optimalQty
      ? "Too many donuts — some went to waste!"
      : "Too few donuts — some customers walked away!";
  surplusChart.data.datasets[0].data = [qty - Math.max(qty - optimalQty, 0)];
  surplusChart.data.datasets[1].data = [Math.max(qty - optimalQty, 0)];
  surplusChart.data.datasets[2].data = [Math.max(optimalQty - qty, 0)];
  surplusChart.update();
  if (qty === optimalQty) {
    gameChart.data.datasets[4].data = [equilibrium];
    gameOver = true;
    document.getElementById('resetBtn').style.display = 'inline';
  } else {
    applyWeatherEffect();
    if (document.getElementById('toggleDemand').checked) {
      gameChart.data.datasets[3].data = Array.from({ length: 151 }, (_, q) => ({ x: q, y: calculateDemand(q) }));
    }
    if (document.getElementById('toggleEquilibrium').checked && equilibrium) {
      gameChart.data.datasets[4].data = [equilibrium];
    }
  }
  document.getElementById('status').innerText = `You baked ${qty} donut(s).`;
  document.getElementById('hint').innerText = hint;
  updateChartBounds();
  gameChart.update();
  day++;
  input.value = '';
}

function updateDebugGraph() {
  gameChart.data.datasets[2].data = document.getElementById('toggleSupply').checked ? supplyCurve : [];
  gameChart.data.datasets[3].data = document.getElementById('toggleDemand').checked ? Array.from({ length: 151 }, (_, q) => ({ x: q, y: calculateDemand(q) })) : [];
  gameChart.data.datasets[4].data = document.getElementById('toggleEquilibrium').checked && equilibrium ? [equilibrium] : [];
  updateChartBounds();
  gameChart.update();
}

function closeModal() {
  document.getElementById('explanationModal').style.display = 'none';
}

function resetGame() {
  location.reload();
}
