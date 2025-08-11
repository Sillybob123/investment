document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    const state = {
        currentPage: 'home',
        portfolio: {
            cash: 100000,
            holdings: {}, // symbol -> {shares, totalCost}
            transactions: [],
            initialValue: 100000,
        },
        openOrders: [], // {id, side, type, symbol, shares, price, createdAt}
        stocks: {
            AAPL: { name: 'Apple Inc.', basePrice: 170, volatility: 0.02, trend: 0.0005, history: [] },
            GOOGL: { name: 'Alphabet Inc.', basePrice: 140, volatility: 0.022, trend: 0.0006, history: [] },
            MSFT: { name: 'Microsoft Corp.', basePrice: 330, volatility: 0.018, trend: 0.0007, history: [] },
            AMZN: { name: 'Amazon.com Inc.', basePrice: 135, volatility: 0.025, trend: 0.0004, history: [] },
            TSLA: { name: 'Tesla Inc.', basePrice: 250, volatility: 0.04, trend: -0.0002, history: [] },
            NVDA: { name: 'NVIDIA Corp.', basePrice: 450, volatility: 0.035, trend: 0.001, history: [] },
        },
        currentStock: 'AAPL',
        stockChart: null,
        marketTrend: 'stable', // stable, bull, bear
        quiz: { questions: [], currentQuestionIndex: 0, score: 0 },
        learningProgress: 0,
    };

    // --- DATA ---
    const contentData = {
        lessons: [
            { id: 1, level: 'Beginner', title: 'Investment Basics', content: `<h3>What is Investing?</h3><p>Investing is allocating money with the expectation of a positive benefit in the future (a return). Returns can come from capital gains or income (dividends/interest).</p><h3>Risk vs. Reward</h3><p>Higher potential returns typically come with higher risk. <em>Diversification</em> helps manage risk.</p><h3>Compounding</h3><p>Reinvested earnings can snowball over time, accelerating growth.</p>` },
            { id: 2, level: 'Beginner', title: 'Stock Market Fundamentals', content: `<h3>What is a Stock?</h3><p>A stock represents ownership in a company. Owners (shareholders) share in assets and profits.</p><h3>How Markets Work</h3><p>Exchanges (NYSE/Nasdaq) match buyers and sellers, enabling liquidity and price discovery.</p>` },
            { id: 3, level: 'Beginner', title: 'Types of Investments', content: `<h3>Stocks</h3><p>Ownership in a public company.</p><h3>Bonds</h3><p>Loans to companies/governments with interest payments.</p><h3>ETFs</h3><p>Baskets of securities that trade like stocks; great for diversification.</p><h3>Mutual Funds</h3><p>Diversified pools of securities managed by professionals.</p>` },
            { id: 4, level: 'Intermediate', title: 'Understanding Order Types', content: `<h3>Market</h3><p>Executes now at the best available price. Guarantees execution, not price.</p><h3>Limit</h3><p>Sets the worst price you are willing to accept (buy ≤ limit, sell ≥ limit). May not fill.</p><h3>Stop</h3><p>Becomes a market order when the stop price hits (sell stop to limit losses; buy stop to enter on strength).</p>` },
            { id: 5, level: 'Intermediate', title: 'Reading Stock Charts', content: `<h3>Technical Basics</h3><p>Price trend and momentum can inform timing. Practice, don't predict.</p><h3>Moving Averages (MA)</h3><p>Smoothed lines that help reveal trend direction (e.g., 20/50 period).</p>` },
            { id: 6, level: 'Advanced', title: 'Risk Management', content: `<h3>Diversification</h3><p>Spread bets across sectors/asset classes.</p><h3>Position Sizing</h3><p>Limit risk per trade (e.g., 1–2% of portfolio).</p><h3>Asset Allocation</h3><p>Mix assets to match your goals and time horizon.</p>` },
        ],
        glossary: [
            { term: "Bull Market", definition: "A period of generally rising prices and optimism." },
            { term: "Bear Market", definition: "A period of generally falling prices (often −20%+ from highs)." },
            { term: "Dividend", definition: "A company payout of profits to shareholders." },
            { term: "P/E Ratio", definition: "Price divided by earnings per share (EPS)." },
            { term: "Market Cap", definition: "Share price × shares outstanding." },
            { term: "Volatility", definition: "How much prices fluctuate; higher = riskier." },
            { term: "Liquidity", definition: "How easily an asset converts to cash at fair value." },
            { term: "Blue Chip", definition: "Large, financially sound, established company." },
            { term: "Time-In-Force", definition: "How long an order stays active (e.g., Day, GTC)." },
            { term: "Stop Order", definition: "Triggers a market order when stop price is hit." }
        ],
        strategies: [
            { id: 'buyhold', level: 'Beginner', title: 'Buy and Hold', content: `<h3>Overview</h3><p>Buy quality and hold long term. Low maintenance and tax-efficient.</p><h3>Cons</h3><ul><li>Requires patience through drawdowns.</li><li>No downside hedge.</li></ul>` },
            { id: 'dca', level: 'Beginner', title: 'Dollar-Cost Averaging', content: `<h3>Overview</h3><p>Invest the same amount on a schedule. Buys more shares when price is low.</p><h3>Pros</h3><ul><li>Reduces timing risk.</li><li>Builds discipline.</li></ul>` },
            { id: 'value', level: 'Intermediate', title: 'Value Investing', content: `<h3>Overview</h3><p>Seek businesses trading below intrinsic value (margin of safety).</p>` },
            { id: 'growth', level: 'Advanced', title: 'Growth Investing', content: `<h3>Overview</h3><p>Focus on companies expected to grow faster than average.</p><h3>Risk</h3><p>Can be volatile; expectations matter.</p>` },
        ],
        quiz: [
            { question: "What is the primary benefit of diversification?", options: ["Guaranteeing high profits", "Reducing overall portfolio risk", "Avoiding all fees", "Focusing on one great company"], correct: 1 },
            { question: "A 'bear market' is characterized by:", options: ["Rising prices", "Stable prices", "Falling prices", "High volume"], correct: 2 },
            { question: "Which order type guarantees execution but NOT price?", options: ["Limit", "Market", "Stop", "Trailing stop"], correct: 1 },
            { question: "Market cap represents:", options: ["Total debt", "Max stock price", "Value of all shares outstanding", "Annual profit"], correct: 2 },
            { question: "DCA means:", options: ["Invest a lump sum at lows", "Sell at target", "Invest fixed amounts regularly", "Buy only falling stocks"], correct: 2 },
            { question: "P/E ratio = price ÷", options: ["EPS", "Equity value", "Annual dividend", "Total assets"], correct: 0 },
            { question: "Main purpose of a sell stop:", options: ["Buy at a low", "Lock in profits", "Limit losses automatically", "Beat the market price"], correct: 2 },
            { question: "An ETF is:", options: ["Risky bond", "Basket trading like a stock", "Savings account", "Single stock"], correct: 1 },
            { question: "Liquidity refers to:", options: ["Company cash", "Water sold", "Ease of converting to cash at fair price", "Dividend flow"], correct: 2 },
            { question: "Key principle of value investing:", options: ["Buy popular growth", "Pay less than intrinsic value", "Day-trade often", "Trade rumors"], correct: 1 }
        ]
    };

    // --- DOM ---
    const pages = document.querySelectorAll('.page');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavLinks = document.getElementById('mobileNavLinks');
    const modal = document.getElementById('modal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // --- HELPERS ---
    const $ = (id) => document.getElementById(id);
    const format = (n) => `$${Number(n).toFixed(2)}`;
    const nowStr = () => new Date().toLocaleString();
    const uid = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // --- INIT ---
    const init = () => {
        // Footer year
        $('year').textContent = new Date().getFullYear();

        populateSelects();
        populateLearningContent();
        populateGlossary();
        populateStrategies();

        initChart();
        generateInitialStockHistory();
        updateDisplay();

        // Quiz
        state.quiz.questions = contentData.quiz;
        $('totalQuestions').textContent = state.quiz.questions.length;

        // Events
        setupEventListeners();

        // Market loops
        setInterval(tickMarket, 3000);  // price updates
        setInterval(changeMarketTrend, 30000); // regime change
    };

    // --- NAVIGATION ---
    const showPage = (pageId) => {
        pages.forEach(p => p.classList.remove('active'));
        $(pageId).classList.add('active');
        state.currentPage = pageId;
        window.scrollTo(0, 0);
        mobileNavLinks.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    };
    window.showPage = showPage;

    // --- EVENTS ---
    const setupEventListeners = () => {
        mobileMenuBtn.addEventListener('click', () => {
            const active = mobileNavLinks.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', String(active));
        });

        modalCloseBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        $('orderType').addEventListener('change', onOrderTypeChange);

        $('startQuizBtn').addEventListener('click', startQuiz);
        $('nextQuestionBtn').addEventListener('click', nextQuestion);

        $('scenarioSelect').addEventListener('change', (e) => {
            state.marketTrend = e.target.value;
            notify(`Market scenario set to: ${state.marketTrend}`, 'info');
        });
        $('shockUpBtn').addEventListener('click', () => shockMarket(+0.03));
        $('shockDownBtn').addEventListener('click', () => shockMarket(-0.03));

        $('saveBtn').addEventListener('click', saveState);
        $('loadBtn').addEventListener('click', loadState);
        $('resetBtn').addEventListener('click', resetState);
    };

    const onOrderTypeChange = () => {
        const type = $('orderType').value;
        $('limitPriceGroup').style.display = type === 'limit' ? 'block' : 'none';
        $('stopPriceGroup').style.display = type === 'stop' ? 'block' : 'none';
    };

    // --- POPULATE ---
    const populateSelects = () => {
        const stockSelect = $('stockSelect');
        stockSelect.innerHTML = Object.keys(state.stocks).map(symbol =>
            `<option value="${symbol}">${symbol} - ${state.stocks[symbol].name}</option>`
        ).join('');

        const orderTypeSelect = $('orderType');
        const orderTypes = ['market', 'limit', 'stop'];
        orderTypeSelect.innerHTML = orderTypes.map(type =>
            `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)} Order</option>`
        ).join('');
    };

    const populateLearningContent = () => {
        const learningPath = $('learningPath');
        learningPath.innerHTML = contentData.lessons.map(lesson => `
            <div class="lesson-card" onclick="openModal('lesson', ${lesson.id})">
                <span class="lesson-status status-${lesson.level.toLowerCase()}">${lesson.level}</span>
                <h3>${lesson.title}</h3>
            </div>
        `).join('');
    };

    const populateGlossary = () => {
        const glossaryGrid = $('glossaryGrid');
        glossaryGrid.innerHTML = contentData.glossary.map(item => `
            <div class="term-card" onclick="openModal('glossary', '${item.term}')">
                <h3>${item.term}</h3>
            </div>
        `).join('');
    };

    const populateStrategies = () => {
        const strategiesPath = $('strategiesPath');
        strategiesPath.innerHTML = contentData.strategies.map(strategy => `
            <div class="lesson-card" onclick="openModal('strategy', '${strategy.id}')">
                <span class="lesson-status status-${strategy.level.toLowerCase()}">${strategy.level}</span>
                <h3>${strategy.title}</h3>
            </div>
        `).join('');
    };

    // --- MODAL ---
    const openModal = (type, id) => {
        let item;
        if (type === 'lesson') item = contentData.lessons.find(l => l.id === id);
        if (type === 'strategy') item = contentData.strategies.find(s => s.id === id);
        if (type === 'glossary') {
            const glossItem = contentData.glossary.find(g => g.term === id);
            item = { title: glossItem.term, content: `<p>${glossItem.definition}</p>` };
        }
        if (item) {
            $('modalTitle').textContent = item.title;
            $('modalBody').innerHTML = item.content;
            modal.classList.add('show');
        }
    };
    window.openModal = openModal;
    const closeModal = () => modal.classList.remove('show');

    // --- CHART ---
    const initChart = () => {
        const ctx = $('stockChartCanvas').getContext('2d');
        state.stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Stock Price',
                    data: [],
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true,
                },
                {
                    label: '20-period MA',
                    data: [],
                    borderColor: 'rgba(118, 75, 162, 1)',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { display: false },
                    y: { ticks: { callback: v => '$' + Number(v).toFixed(2) } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false, callbacks: { label: ctx => `$${ctx.parsed.y.toFixed(2)}` } }
                },
            }
        });
    };

    const updateChart = () => {
        if (!state.stockChart) return;
        const stockData = state.stocks[state.currentStock];
        const prices = stockData.history;
        const labels = prices.map((_, i) => i);
        const ma20 = movingAverage(prices, 20);

        state.stockChart.data.labels = labels;
        state.stockChart.data.datasets[0].data = prices;
        state.stockChart.data.datasets[1].data = ma20;
        state.stockChart.update('none');
    };

    const movingAverage = (arr, period) => {
        const out = [];
        for (let i = 0; i < arr.length; i++) {
            const start = Math.max(0, i - period + 1);
            const slice = arr.slice(start, i + 1);
            const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
            out.push(avg);
        }
        return out;
    };

    // --- MARKET ENGINE ---
    const generateInitialStockHistory = () => {
        Object.keys(state.stocks).forEach(symbol => {
            const stock = state.stocks[symbol];
            let price = stock.basePrice;
            for (let i = 0; i < 100; i++) {
                const change = (Math.random() - 0.5) * stock.volatility;
                price *= (1 + change + stock.trend);
                stock.history.push(Math.max(price, stock.basePrice * 0.2));
            }
        });
    };

    const tickMarket = () => {
        Object.keys(state.stocks).forEach(symbol => {
            const stock = state.stocks[symbol];
            const trendMult = state.marketTrend === 'bull' ? 1.6 : state.marketTrend === 'bear' ? -1.6 : 1;
            const drift = stock.trend * trendMult;
            const change = (Math.random() - 0.48) * stock.volatility; // slight upward bias
            let newPrice = stock.history[stock.history.length - 1] * (1 + change + drift);
            newPrice = Math.max(newPrice, stock.basePrice * 0.2);
            stock.history.push(newPrice);
            if (stock.history.length > 200) stock.history.shift();
        });

        processOpenOrders(); // check triggers and fills
        updateDisplay();
    };

    const changeMarketTrend = () => {
        const trends = ['stable', 'bull', 'bear'];
        const newTrend = trends[Math.floor(Math.random() * trends.length)];
        if (newTrend !== state.marketTrend) {
            state.marketTrend = newTrend;
            notify(`The market trend is now: ${newTrend[0].toUpperCase() + newTrend.slice(1)}`, 'info');
        }
    };

    const shockMarket = (magnitude = 0.03) => {
        Object.values(state.stocks).forEach(stock => {
            const last = stock.history[stock.history.length - 1];
            const shocked = Math.max(last * (1 + magnitude), stock.basePrice * 0.2);
            stock.history[stock.history.length - 1] = shocked;
        });
        processOpenOrders();
        updateDisplay();
        notify(`Applied a market shock (${magnitude > 0 ? '+' : ''}${Math.round(magnitude * 100)}%)`, 'info');
    };

    window.changeStock = () => {
        state.currentStock = $('stockSelect').value;
        updateDisplay();
    };

    // --- TRADING ---
    window.tradeStock = (side) => {
        const symbol = state.currentStock;
        const shares = parseInt($('shareAmount').value, 10);
        const orderType = $('orderType').value;
        const limitPrice = parseFloat($('limitPrice').value);
        const stopPrice = parseFloat($('stopPrice').value);
        const currentPrice = getCurrentPrice(symbol);

        if (isNaN(shares) || shares <= 0) return notify('Please enter a valid number of shares.', 'error');

        if (orderType === 'market') {
            executeMarketOrder(side, symbol, shares, currentPrice);
            return;
        }

        if (orderType === 'limit') {
            if (isNaN(limitPrice) || limitPrice <= 0) return notify('Enter a valid limit price.', 'error');
            // Immediate fill if price is favorable; otherwise queue as open limit order
            if ((side === 'buy' && currentPrice <= limitPrice) || (side === 'sell' && currentPrice >= limitPrice)) {
                executeLimitOrder(side, symbol, shares, limitPrice, currentPrice);
            } else {
                // Place order
                enqueueOrder({ side, type: 'limit', symbol, shares, price: limitPrice });
                notify(`${side.toUpperCase()} LIMIT placed for ${shares} ${symbol} @ ${format(limitPrice)}`, 'info');
            }
            return;
        }

        if (orderType === 'stop') {
            if (isNaN(stopPrice) || stopPrice <= 0) return notify('Enter a valid stop price.', 'error');
            // Stop becomes market when triggered; if already triggered, fill immediately
            if ((side === 'sell' && currentPrice <= stopPrice) || (side === 'buy' && currentPrice >= stopPrice)) {
                executeMarketOrder(side, symbol, shares, currentPrice);
            } else {
                enqueueOrder({ side, type: 'stop', symbol, shares, price: stopPrice });
                notify(`${side.toUpperCase()} STOP placed for ${shares} ${symbol} @ ${format(stopPrice)} (triggers into market)`, 'info');
            }
            return;
        }
    };

    const enqueueOrder = (order) => {
        state.openOrders.unshift({ id: uid(), createdAt: nowStr(), ...order });
        if (state.openOrders.length > 50) state.openOrders.pop();
        renderOpenOrders();
    };

    const cancelOrder = (id) => {
        state.openOrders = state.openOrders.filter(o => o.id !== id);
        renderOpenOrders();
        notify('Order canceled.', 'info');
    };

    const getCurrentPrice = (symbol) => {
        const s = state.stocks[symbol];
        return s.history[s.history.length - 1];
    };

    const executeMarketOrder = (side, symbol, shares, price) => {
        const px = price; // could add slippage later
        const cost = shares * px;

        if (side === 'buy') {
            if (state.portfolio.cash < cost) return notify('Not enough cash to buy.', 'error');
            state.portfolio.cash -= cost;
            const holding = state.portfolio.holdings[symbol] || { shares: 0, totalCost: 0 };
            holding.shares += shares;
            holding.totalCost += cost;
            state.portfolio.holdings[symbol] = holding;
            addTransaction('buy', symbol, shares, px);
            notify(`Bought ${shares} ${symbol} @ ${format(px)}`, 'success');
        } else {
            const holding = state.portfolio.holdings[symbol];
            if (!holding || holding.shares < shares) return notify(`You don't own enough ${symbol}.`, 'error');
            // reduce average cost proportionally
            const avgCost = holding.totalCost / holding.shares;
            const costOfSold = avgCost * shares;
            holding.shares -= shares;
            holding.totalCost -= costOfSold;
            if (holding.shares === 0) delete state.portfolio.holdings[symbol];

            state.portfolio.cash += cost;
            addTransaction('sell', symbol, shares, px);
            notify(`Sold ${shares} ${symbol} @ ${format(px)}`, 'success');
        }

        updateDisplay();
    };

    const executeLimitOrder = (side, symbol, shares, limitPrice, currentPrice) => {
        // In real markets, fills at best price. Use favorable price between current and limit.
        // Buy fills at min(current, limit), Sell fills at max(current, limit).
        const execPx = side === 'buy' ? Math.min(currentPrice, limitPrice) : Math.max(currentPrice, limitPrice);
        executeMarketOrder(side, symbol, shares, execPx);
    };

    const processOpenOrders = () => {
        if (state.openOrders.length === 0) return;
        const remaining = [];
        for (const order of state.openOrders) {
            const currentPrice = getCurrentPrice(order.symbol);
            if (order.type === 'limit') {
                const canFill = (order.side === 'buy' && currentPrice <= order.price) ||
                                (order.side === 'sell' && currentPrice >= order.price);
                if (canFill) {
                    executeLimitOrder(order.side, order.symbol, order.shares, order.price, currentPrice);
                    continue;
                }
            } else if (order.type === 'stop') {
                const triggered = (order.side === 'sell' && currentPrice <= order.price) ||
                                  (order.side === 'buy' && currentPrice >= order.price);
                if (triggered) {
                    executeMarketOrder(order.side, order.symbol, order.shares, currentPrice);
                    continue;
                }
            }
            remaining.push(order);
        }
        state.openOrders = remaining;
        renderOpenOrders();
    };

    const addTransaction = (type, symbol, shares, price) => {
        state.portfolio.transactions.unshift({ type, symbol, shares, price, timestamp: nowStr() });
        if (state.portfolio.transactions.length > 40) state.portfolio.transactions.pop();
    };

    // --- DISPLAY ---
    const updateDisplay = () => {
        const portfolio = state.portfolio;
        const currentStockData = state.stocks[state.currentStock];
        const currentPrice = getCurrentPrice(state.currentStock);

        // Header + price
        $('currentStock').textContent = `${state.currentStock} - ${currentStockData.name}`;
        const priceElement = $('currentPrice');
        const old = parseFloat(priceElement.textContent.replace('$', '')) || currentPrice;
        priceElement.textContent = format(currentPrice);
        priceElement.style.color = currentPrice >= old ? 'var(--success-color)' : 'var(--danger-color)';

        // Chart
        updateChart();

        // Holdings value
        let holdingsValue = 0;
        Object.keys(portfolio.holdings).forEach(symbol => {
            const h = portfolio.holdings[symbol];
            const px = getCurrentPrice(symbol);
            holdingsValue += h.shares * px;
        });
        const totalValue = portfolio.cash + holdingsValue;
        const pnl = totalValue - portfolio.initialValue;

        $('cashBalance').textContent = format(portfolio.cash);
        $('portfolioValue').textContent = format(holdingsValue);
        $('totalValue').textContent = format(totalValue);
        const pnlEl = $('totalPnL');
        pnlEl.textContent = `${pnl >= 0 ? '+' : ''}${format(pnl)}`;
        pnlEl.style.color = pnl >= 0 ? 'var(--success-color)' : 'var(--danger-color)';

        // Holdings list
        const holdingsList = $('holdingsList');
        if (Object.keys(portfolio.holdings).length === 0) {
            holdingsList.innerHTML = '<p class="empty-state">No holdings yet. Start investing!</p>';
        } else {
            holdingsList.innerHTML = Object.entries(portfolio.holdings).map(([symbol, h]) => {
                const px = getCurrentPrice(symbol);
                const avg = h.totalCost / h.shares;
                const value = h.shares * px;
                const hpnl = value - h.totalCost;
                return `
                    <div class="holding-item">
                        <div>
                            <strong>${symbol}</strong><br>
                            <small>${h.shares} shares @ ${format(avg)}</small>
                        </div>
                        <div style="text-align:right;">
                            <strong>${format(value)}</strong><br>
                            <small class="holding-pnl" style="color:${hpnl >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">
                                ${hpnl >= 0 ? '+' : ''}${format(hpnl)}
                            </small>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Transactions
        const txBox = $('transactionHistory');
        if (portfolio.transactions.length === 0) {
            txBox.innerHTML = '<p class="empty-state">No transactions yet.</p>';
        } else {
            txBox.innerHTML = portfolio.transactions.map(tx => `
                <div class="transaction-item">
                    <strong class="tx-${tx.type}">${tx.type.toUpperCase()} ${tx.symbol}</strong>
                    <span> ${tx.shares} shares @ ${format(tx.price)} — <small>${tx.timestamp}</small></span>
                </div>
            `).join('');
        }

        renderOpenOrders();
    };

    const renderOpenOrders = () => {
        const box = $('openOrdersList');
        if (state.openOrders.length === 0) {
            box.innerHTML = '<p class="empty-state">No open orders.</p>';
            return;
        }
        box.innerHTML = state.openOrders.map(o => `
            <div class="order-item">
                <div>
                    <strong>${o.side.toUpperCase()} ${o.symbol}</strong>
                    <div class="order-meta">${o.type.toUpperCase()} • ${o.shares} shares • ${o.type === 'stop' ? 'Stop' : 'Limit'} ${format(o.price)} • <small>${o.createdAt}</small></div>
                </div>
                <div class="order-actions">
                    <button onclick="cancelOrder('${o.id}')" aria-label="Cancel order ${o.id}"><i class="fas fa-times"></i> Cancel</button>
                </div>
            </div>
        `).join('');
    };
    window.cancelOrder = cancelOrder;

    // --- QUIZ ---
    const startQuiz = () => {
        $('quizStart').style.display = 'none';
        $('quizArea').style.display = 'block';
        state.quiz.currentQuestionIndex = 0;
        state.quiz.score = 0;
        displayQuestion();
    };

    const displayQuestion = () => {
        const quiz = state.quiz;
        if (quiz.currentQuestionIndex >= quiz.questions.length) return showQuizResults();

        const q = quiz.questions[quiz.currentQuestionIndex];
        $('currentQuestionNum').textContent = quiz.currentQuestionIndex + 1;
        $('questionText').textContent = q.question;

        const optionsContainer = $('quizOptions');
        optionsContainer.innerHTML = q.options.map((opt, i) => `<div class="quiz-option" data-index="${i}" role="option">${opt}</div>`).join('');
        optionsContainer.querySelectorAll('.quiz-option').forEach(opt => opt.addEventListener('click', selectAnswer));

        $('quizFeedback').textContent = '';
        $('nextQuestionBtn').style.display = 'none';

        const progress = (quiz.currentQuestionIndex / quiz.questions.length) * 100;
        $('quizProgress').style.width = `${progress}%`;
    };

    const selectAnswer = (e) => {
        const selected = e.target;
        const selectedIndex = parseInt(selected.dataset.index, 10);
        const question = state.quiz.questions[state.quiz.currentQuestionIndex];
        const correctIndex = question.correct;

        document.querySelectorAll('.quiz-option').forEach(opt => {
            opt.removeEventListener('click', selectAnswer);
        });

        if (selectedIndex === correctIndex) {
            selected.classList.add('correct');
            $('quizFeedback').textContent = "Correct!";
            $('quizFeedback').style.color = 'var(--success-color)';
            state.quiz.score++;
        } else {
            selected.classList.add('incorrect');
            // FIX: correctly mark the right one
            const optionsContainer = $('quizOptions');
            optionsContainer.children[correctIndex].classList.add('correct');
            $('quizFeedback').textContent = "Not quite!";
            $('quizFeedback').style.color = 'var(--danger-color)';
        }

        $('nextQuestionBtn').style.display = 'block';
    };

    const nextQuestion = () => {
        state.quiz.currentQuestionIndex++;
        displayQuestion();
    };

    const showQuizResults = () => {
        $('quizArea').style.display = 'none';
        $('quizResults').style.display = 'block';

        const finalScore = Math.round((state.quiz.score / state.quiz.questions.length) * 100);
        $('finalScore').textContent = `${finalScore}%`;
        $('quizResultText').textContent =
            finalScore > 90 ? "Excellent! You're a true investing pro!" :
            finalScore > 70 ? "Great job! You have a solid understanding." :
            "Good effort! Keep learning and practicing.";

        state.learningProgress = Math.max(state.learningProgress, finalScore);
        $('learningProgress').style.width = `${state.learningProgress}%`;
        $('progressText').textContent = `Progress: ${state.learningProgress}% Complete`;
    };

    window.restartQuiz = () => {
        $('quizResults').style.display = 'none';
        $('quizStart').style.display = 'block';
        $('quizProgress').style.width = '0%';
    };

    // --- SAVE / LOAD / RESET ---
    const saveState = () => {
        const dump = JSON.stringify({
            portfolio: state.portfolio,
            openOrders: state.openOrders,
            currentStock: state.currentStock,
            marketTrend: state.marketTrend,
            stocks: Object.fromEntries(Object.entries(state.stocks).map(([sym, s]) => [sym, { ...s, history: s.history }]))
        });
        localStorage.setItem('investlearn_state', dump);
        notify('Progress saved locally.', 'success');
    };

    const loadState = () => {
        const raw = localStorage.getItem('investlearn_state');
        if (!raw) return notify('No saved progress found.', 'error');
        try {
            const data = JSON.parse(raw);
            Object.assign(state.portfolio, data.portfolio);
            state.openOrders = data.openOrders || [];
            state.currentStock = data.currentStock || state.currentStock;
            state.marketTrend = data.marketTrend || state.marketTrend;

            // restore histories
            Object.keys(state.stocks).forEach(sym => {
                if (data.stocks && data.stocks[sym] && Array.isArray(data.stocks[sym].history)) {
                    state.stocks[sym].history = data.stocks[sym].history.slice(-200);
                }
            });
            $('stockSelect').value = state.currentStock;
            $('scenarioSelect').value = state.marketTrend;
            updateDisplay();
            notify('Progress loaded.', 'success');
        } catch {
            notify('Could not load saved data.', 'error');
        }
    };

    const resetState = () => {
        if (!confirm('Reset portfolio and orders?')) return;
        state.portfolio = { cash: 100000, holdings: {}, transactions: [], initialValue: 100000 };
        state.openOrders = [];
        Object.values(state.stocks).forEach(s => { s.history = []; });
        generateInitialStockHistory();
        updateDisplay();
        notify('Simulator reset.', 'info');
    };

    // --- NOTIFICATION ---
    const notify = (message, type = 'info') => {
        const n = $('notification');
        n.textContent = message;
        n.className = `notification ${type}`;
        n.classList.add('show');
        setTimeout(() => n.classList.remove('show'), 3000);
    };

    // --- GO! ---
    init();
});
