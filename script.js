document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        currentPage: 'home',
        portfolio: {
            cash: 100000,
            holdings: {},
            transactions: [],
            initialValue: 100000,
        },
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
        quiz: {
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            userAnswers: [],
        },
        learningProgress: 0,
    };

    // --- DATA ---
    const contentData = {
        lessons: [
            { id: 1, level: 'Beginner', title: 'Investment Basics', content: `<h3>What is Investing?</h3><p>Investing is allocating money with the expectation of a positive benefit in the future. In finance, this benefit is called a return. The return may consist of a gain (profit) or a loss realized from the sale of a property or investment, unrealized capital appreciation, or investment income like dividends, interest, or rental income.</p><h3>Risk vs. Reward</h3><p>This is the fundamental trade-off in all investing. Higher potential returns on an investment are generally accompanied by higher risk. There is no guarantee that you will actually get a higher return by accepting more risk. Diversification is a key technique to manage this risk.</p><h3>The Power of Compound Interest</h3><p>Often called the "eighth wonder of the world," compounding is the process where an asset's earnings, from either capital gains or interest, are reinvested to generate additional earnings over time. This growth, calculated on the initial principal and the accumulated earnings from previous periods, can create a snowball effect, making your money grow at an accelerating rate.</p>` },
            { id: 2, level: 'Beginner', title: 'Stock Market Fundamentals', content: `<h3>What is a Stock?</h3><p>A stock (also known as equity) is a security that represents the ownership of a fraction of a corporation. This entitles the owner of the stock to a proportion of the corporation's assets and profits equal to how much stock they own. Units of stock are called "shares."</p><h3>How Stock Markets Work</h3><p>Stock markets are venues where buyers and sellers meet to exchange shares in publicly traded companies. Major exchanges like the NYSE or NASDAQ provide a regulated and transparent environment for this trading to occur, facilitating price discovery and liquidity.</p>` },
            { id: 3, level: 'Beginner', title: 'Types of Investments', content: `<h3>Stocks</h3><p>Ownership in a public company.</p><h3>Bonds</h3><p>A loan made by an investor to a borrower (typically corporate or governmental).</p><h3>ETFs (Exchange-Traded Funds)</h3><p>A basket of securities—stocks, bonds, etc.—that you can buy or sell on a stock exchange like a regular stock. They offer diversification and are typically low-cost.</p><h3>Mutual Funds</h3><p>A pool of money collected from many investors to invest in a diversified portfolio of stocks, bonds, or other assets. Managed by professional fund managers.</p>` },
            { id: 4, level: 'Intermediate', title: 'Understanding Order Types', content: `<h3>Market Order</h3><p>An order to buy or sell a stock immediately at the best available current price. It guarantees execution but not the price.</p><h3>Limit Order</h3><p>An order to buy or sell a stock at a specific price or better. A buy limit order can only be executed at the limit price or lower, and a sell limit order can only be executed at the limit price or higher. It guarantees the price but not execution.</p><h3>Stop-Loss Order</h3><p>An order placed to sell a security when it reaches a certain price. It is designed to limit an investor's loss on a security position. For example, setting a stop-loss order for 10% below the price at which you bought the stock will limit your loss to 10%.</p>` },
            { id: 5, level: 'Intermediate', title: 'Reading Stock Charts', content: `<h3>What is Technical Analysis?</h3><p>Technical analysis is a trading discipline employed to evaluate investments and identify trading opportunities by analyzing statistical trends gathered from trading activity, such as price movement and volume.</p><h3>Key Indicators</h3><p><strong>Moving Averages (MA):</strong> Smooths out price data to create a single flowing line, making it easier to identify the direction of the trend.</p><p><strong>Relative Strength Index (RSI):</strong> A momentum indicator that measures the speed and change of price movements. RSI oscillates between zero and 100. Traditionally, an asset is considered overbought when RSI is above 70 and oversold when it is below 30.</p>` },
            { id: 6, level: 'Advanced', title: 'Risk Management', content: `<h3>Diversification</h3><p>The strategy of investing in a variety of assets to reduce the overall risk of a portfolio. The idea is that if one investment performs poorly, the others may offset those losses.</p><h3>Position Sizing</h3><p>The process of determining how many shares or units of a particular security to purchase. Proper position sizing can help manage risk by ensuring that no single investment can have a disproportionately large negative impact on the overall portfolio.</p><h3>Asset Allocation</h3><p>The implementation of an investment strategy that attempts to balance risk versus reward by adjusting the percentage of each asset in an investment portfolio according to the investor's risk tolerance, goals, and investment time horizon.</p>` },
        ],
        glossary: [
            { term: "Bull Market", definition: "A period of generally rising prices. In a bull market, investors are optimistic about the market's future performance." },
            { term: "Bear Market", definition: "A period of generally falling prices, often defined as a decline of 20% or more from recent highs." },
            { term: "Dividend", definition: "A distribution of a portion of a company's earnings, decided by the board of directors, to a class of its shareholders." },
            { term: "P/E Ratio", definition: "The Price-to-Earnings ratio is the ratio for valuing a company that measures its current share price relative to its per-share earnings (EPS)." },
            { term: "Market Cap", definition: "The total market value of a company's outstanding shares of stock. It is calculated by multiplying the company's share price by the number of shares outstanding." },
            { term: "Volatility", definition: "A statistical measure of the dispersion of returns for a given security or market index. In most cases, the higher the volatility, the riskier the security." },
            { term: "Liquidity", definition: "The degree to which an asset can be quickly bought or sold in the market at a price reflecting its current value. Cash is the most liquid asset." },
            { term: "Blue Chip", definition: "A large, well-established, and financially sound company that has operated for many years and has a reputation for quality and reliability." },
        ],
        strategies: [
            { id: 'buyhold', level: 'Beginner', title: 'Buy and Hold', content: `<h3>Overview</h3><p>Buy and hold is a passive investment strategy where an investor buys stocks and holds them for a long period, regardless of fluctuations in the market.</p><h3>Pros:</h3><ul><li>Simple to implement and low maintenance.</li><li>Tax-efficient, as it often results in long-term capital gains, which are taxed at a lower rate.</li><li>Benefits from the power of compounding over time.</li></ul><h3>Cons:</h3><ul><li>Requires patience and discipline to not sell during market downturns.</li><li>Does not protect against prolonged bear markets.</li></ul>` },
            { id: 'dca', level: 'Beginner', title: 'Dollar-Cost Averaging', content: `<h3>Overview</h3><p>Dollar-cost averaging (DCA) is the practice of investing a fixed dollar amount on a regular schedule, regardless of the share price. It's a way to smooth out the average cost of your investment.</p><h3>How It Works:</h3><p>You invest the same amount of money each period (e.g., $100 per month). You end up buying more shares when prices are low and fewer shares when prices are high.</p><h3>Pros:</h3><ul><li>Reduces the risk of investing a large amount at the wrong time.</li><li>Automates investing and builds discipline.</li><li>Removes emotion from investment decisions.</li></ul>` },
            { id: 'value', level: 'Intermediate', title: 'Value Investing', content: `<h3>Overview</h3><p>Popularized by Benjamin Graham and Warren Buffett, value investing is the strategy of picking stocks that appear to be trading for less than their intrinsic or book value.</p><h3>How It Works:</h3><p>Value investors actively seek out stocks they believe the market has undervalued. They use financial analysis, such as looking at P/E ratios and financial statements, to find these bargains.</p><h3>Pros:</h3><ul><li>Potential for high returns if the market recognizes the stock's true value.</li><li>Focuses on a company's fundamental health, providing a "margin of safety."</li></ul>` },
            { id: 'growth', level: 'Advanced', title: 'Growth Investing', content: `<h3>Overview</h3><p>Growth investing is a style of investment strategy focused on capital appreciation. Growth investors seek out companies that are expected to grow at an above-average rate compared to other companies in the market.</p><h3>Characteristics of Growth Stocks:</h3><ul><li>Often in rapidly expanding industries like technology or biotech.</li><li>Tend to reinvest profits back into the business rather than paying dividends.</li><li>May have high P/E ratios, reflecting high expectations for future growth.</li></ul><h3>Risks:</h3><p>Growth stocks can be volatile. If growth expectations are not met, the stock price can fall sharply.</p>` },
        ],
        quiz: [
            { question: "What is the primary benefit of diversification in investing?", options: ["Guaranteeing high profits", "Reducing overall portfolio risk", "Avoiding all transaction fees", "Focusing on a single, strong company"], correct: 1 },
            { question: "A 'bear market' is characterized by:", options: ["Rising prices and investor optimism", "Stable prices for a long period", "Falling prices and investor pessimism", "High trading volume"], correct: 2 },
            { question: "Which order type guarantees execution but NOT price?", options: ["Limit Order", "Market Order", "Stop Order", "Trailing Stop Order"], correct: 1 },
            { question: "What does a company's 'Market Cap' represent?", options: ["The company's total debt", "The maximum price a stock can reach", "The total value of all its outstanding shares", "The company's annual profit"], correct: 2 },
            { question: "Dollar-Cost Averaging (DCA) is a strategy where you:", options: ["Invest a large sum when the market is low", "Sell stocks when they reach a target price", "Invest a fixed amount of money at regular intervals", "Only buy stocks that are going down"], correct: 2 },
            { question: "A stock's P/E ratio is calculated by dividing the stock's price by its:", options: ["Earnings Per Share (EPS)", "Equity Value", "Annual Dividend", "Total Assets"], correct: 0 },
            { question: "What is the main purpose of a 'stop-loss' order?", options: ["To buy a stock when it hits a low price", "To lock in profits on a rising stock", "To automatically sell a stock to limit potential losses", "To get a better price than the market offers"], correct: 2 },
            { question: "An Exchange-Traded Fund (ETF) is best described as:", options: ["A type of high-risk government bond", "A basket of securities that trades on an exchange like a stock", "A savings account with high interest", "A single company's stock"], correct: 1 },
            { question: "What does 'liquidity' refer to in financial markets?", options: ["How much cash a company has", "The amount of water a company sells", "How easily an asset can be converted into cash without affecting its price", "The flow of dividends to shareholders"], correct: 2 },
            { question: "Which of these is a key principle of 'Value Investing'?", options: ["Buying popular, fast-growing stocks", "Finding and buying stocks for less than their intrinsic worth", "Trading stocks very frequently for small gains", "Investing based on market rumors"], correct: 1 }
        ]
    };

    // --- DOM ELEMENTS ---
    const pages = document.querySelectorAll('.page');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavLinks = document.getElementById('mobileNavLinks');
    const modal = document.getElementById('modal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    // --- INITIALIZATION ---
    const init = () => {
        // Populate dynamic content
        populateSelects();
        populateLearningContent();
        populateGlossary();
        populateStrategies();

        // Setup simulator
        initChart();
        generateInitialStockHistory();
        updateDisplay();

        // Setup quiz
        state.quiz.questions = contentData.quiz;
        document.getElementById('totalQuestions').textContent = state.quiz.questions.length;

        // Setup event listeners
        setupEventListeners();

        // Start market simulation
        setInterval(updateStockPrices, 3000); // Update every 3 seconds
        setInterval(changeMarketTrend, 30000); // Change trend every 30 seconds
    };

    // --- PAGE NAVIGATION ---
    const showPage = (pageId) => {
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        state.currentPage = pageId;
        window.scrollTo(0, 0);
        
        // Close mobile menu on navigation
        mobileNavLinks.classList.remove('active');
    };
    window.showPage = showPage; // Make it accessible from HTML onclick

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNavLinks.classList.toggle('active');
        });

        modalCloseBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.getElementById('orderType').addEventListener('change', (e) => {
            document.getElementById('limitPriceGroup').style.display = e.target.value === 'limit' ? 'block' : 'none';
        });

        document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
        document.getElementById('nextQuestionBtn').addEventListener('click', nextQuestion);
    };

    // --- DYNAMIC CONTENT POPULATION ---
    const populateSelects = () => {
        const stockSelect = document.getElementById('stockSelect');
        stockSelect.innerHTML = Object.keys(state.stocks).map(symbol => 
            `<option value="${symbol}">${symbol} - ${state.stocks[symbol].name}</option>`
        ).join('');

        const orderTypeSelect = document.getElementById('orderType');
        const orderTypes = ['market', 'limit', 'stop'];
        orderTypeSelect.innerHTML = orderTypes.map(type => 
            `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)} Order</option>`
        ).join('');
    };

    const populateLearningContent = () => {
        const learningPath = document.getElementById('learningPath');
        learningPath.innerHTML = contentData.lessons.map(lesson => `
            <div class="lesson-card" onclick="openModal('lesson', ${lesson.id})">
                <span class="lesson-status status-${lesson.level.toLowerCase()}">${lesson.level}</span>
                <h3>${lesson.title}</h3>
            </div>
        `).join('');
    };

    const populateGlossary = () => {
        const glossaryGrid = document.getElementById('glossaryGrid');
        glossaryGrid.innerHTML = contentData.glossary.map(item => `
            <div class="term-card" onclick="openModal('glossary', '${item.term}')">
                <h3>${item.term}</h3>
            </div>
        `).join('');
    };

    const populateStrategies = () => {
        const strategiesPath = document.getElementById('strategiesPath');
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
            document.getElementById('modalTitle').textContent = item.title;
            document.getElementById('modalBody').innerHTML = item.content;
            modal.classList.add('show');
        }
    };
    window.openModal = openModal;

    const closeModal = () => modal.classList.remove('show');

    // --- SIMULATOR: CHART ---
    const initChart = () => {
        const ctx = document.getElementById('stockChartCanvas').getContext('2d');
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
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { display: false },
                    y: { 
                        ticks: {
                            callback: value => '$' + value.toFixed(2)
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: context => `$${context.parsed.y.toFixed(2)}`
                        }
                    }
                },
            }
        });
    };

    const updateChart = () => {
        if (!state.stockChart) return;
        const stockData = state.stocks[state.currentStock];
        state.stockChart.data.labels = stockData.history.map((_, i) => i);
        state.stockChart.data.datasets[0].data = stockData.history;
        state.stockChart.update('none'); // 'none' for no animation
    };

    // --- SIMULATOR: MARKET LOGIC ---
    const generateInitialStockHistory = () => {
        Object.keys(state.stocks).forEach(symbol => {
            const stock = state.stocks[symbol];
            let price = stock.basePrice;
            for (let i = 0; i < 100; i++) {
                const change = (Math.random() - 0.5) * stock.volatility;
                price *= (1 + change + stock.trend);
                stock.history.push(price);
            }
        });
    };

    const updateStockPrices = () => {
        Object.keys(state.stocks).forEach(symbol => {
            const stock = state.stocks[symbol];
            const trendMultiplier = state.marketTrend === 'bull' ? 1.5 : state.marketTrend === 'bear' ? -1.5 : 1;
            const change = (Math.random() - 0.48) * stock.volatility; // slight positive bias
            let newPrice = stock.history[stock.history.length - 1] * (1 + change + (stock.trend * trendMultiplier));
            newPrice = Math.max(newPrice, stock.basePrice * 0.2); // Prevent price from going to zero
            
            stock.history.push(newPrice);
            if (stock.history.length > 100) {
                stock.history.shift();
            }
        });
        updateDisplay();
    };

    const changeMarketTrend = () => {
        const trends = ['stable', 'bull', 'bear'];
        const newTrend = trends[Math.floor(Math.random() * trends.length)];
        if (newTrend !== state.marketTrend) {
            state.marketTrend = newTrend;
            const trendText = state.marketTrend.charAt(0).toUpperCase() + state.marketTrend.slice(1);
            showNotification(`The market trend is now: ${trendText}`, 'info');
        }
    };

    window.changeStock = () => {
        state.currentStock = document.getElementById('stockSelect').value;
        updateDisplay();
    };

    // --- SIMULATOR: TRADING LOGIC ---
    window.tradeStock = (type) => {
        const symbol = state.currentStock;
        const shares = parseInt(document.getElementById('shareAmount').value);
        const orderType = document.getElementById('orderType').value;
        const limitPrice = parseFloat(document.getElementById('limitPrice').value);
        const currentPrice = state.stocks[symbol].history[state.stocks[symbol].history.length - 1];
        
        if (isNaN(shares) || shares <= 0) {
            showNotification('Please enter a valid number of shares.', 'error');
            return;
        }

        let executionPrice = currentPrice;

        if (orderType === 'limit') {
            if (isNaN(limitPrice) || limitPrice <= 0) {
                showNotification('Please enter a valid limit price.', 'error');
                return;
            }
            if (type === 'buy' && limitPrice < currentPrice) {
                showNotification(`Limit price ($${limitPrice.toFixed(2)}) is below market price. Order not filled.`, 'info');
                return;
            }
            if (type === 'sell' && limitPrice > currentPrice) {
                showNotification(`Limit price ($${limitPrice.toFixed(2)}) is above market price. Order not filled.`, 'info');
                return;
            }
            executionPrice = limitPrice;
        }
        
        const totalCost = shares * executionPrice;

        if (type === 'buy') {
            if (state.portfolio.cash < totalCost) {
                showNotification('Not enough cash to complete this purchase.', 'error');
                return;
            }
            state.portfolio.cash -= totalCost;
            const holding = state.portfolio.holdings[symbol] || { shares: 0, totalCost: 0 };
            holding.totalCost += totalCost;
            holding.shares += shares;
            state.portfolio.holdings[symbol] = holding;
            showNotification(`Bought ${shares} shares of ${symbol} at $${executionPrice.toFixed(2)}`, 'success');
        } else { // Sell
            const holding = state.portfolio.holdings[symbol];
            if (!holding || holding.shares < shares) {
                showNotification(`You don't own enough shares of ${symbol}.`, 'error');
                return;
            }
            const costOfSoldShares = (holding.totalCost / holding.shares) * shares;
            holding.totalCost -= costOfSoldShares;
            holding.shares -= shares;
            if (holding.shares === 0) {
                delete state.portfolio.holdings[symbol];
            }
            state.portfolio.cash += totalCost;
            showNotification(`Sold ${shares} shares of ${symbol} at $${executionPrice.toFixed(2)}`, 'success');
        }

        addTransaction(type, symbol, shares, executionPrice);
        updateDisplay();
    };

    const addTransaction = (type, symbol, shares, price) => {
        state.portfolio.transactions.unshift({
            type, symbol, shares, price,
            timestamp: new Date().toLocaleString()
        });
        if (state.portfolio.transactions.length > 20) {
            state.portfolio.transactions.pop();
        }
    };

    // --- DISPLAY UPDATES ---
    const updateDisplay = () => {
        const portfolio = state.portfolio;
        const currentStockData = state.stocks[state.currentStock];
        const currentPrice = currentStockData.history[currentStockData.history.length - 1];

        // Update chart and price
        document.getElementById('currentStock').textContent = `${state.currentStock} - ${currentStockData.name}`;
        const priceElement = document.getElementById('currentPrice');
        const oldPrice = parseFloat(priceElement.textContent.replace('$', '')) || currentPrice;
        priceElement.textContent = `$${currentPrice.toFixed(2)}`;
        priceElement.style.color = currentPrice >= oldPrice ? 'var(--success-color)' : 'var(--danger-color)';
        updateChart();

        // Update portfolio summary
        let holdingsValue = 0;
        Object.keys(portfolio.holdings).forEach(symbol => {
            const holding = portfolio.holdings[symbol];
            const price = state.stocks[symbol].history[state.stocks[symbol].history.length - 1];
            holdingsValue += holding.shares * price;
        });

        const totalValue = portfolio.cash + holdingsValue;
        const pnl = totalValue - portfolio.initialValue;

        document.getElementById('cashBalance').textContent = `$${portfolio.cash.toFixed(2)}`;
        document.getElementById('portfolioValue').textContent = `$${holdingsValue.toFixed(2)}`;
        document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
        const pnlElement = document.getElementById('totalPnL');
        pnlElement.textContent = `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`;
        pnlElement.style.color = pnl >= 0 ? '#4CAF50' : '#f44336';

        // Update holdings list
        const holdingsList = document.getElementById('holdingsList');
        if (Object.keys(portfolio.holdings).length === 0) {
            holdingsList.innerHTML = '<p class="empty-state">No holdings yet. Start investing!</p>';
        } else {
            holdingsList.innerHTML = Object.entries(portfolio.holdings).map(([symbol, holding]) => {
                const price = state.stocks[symbol].history[state.stocks[symbol].history.length - 1];
                const avgPrice = holding.totalCost / holding.shares;
                const currentValue = holding.shares * price;
                const holdingPnl = currentValue - holding.totalCost;
                return `
                    <div class="holding-item">
                        <div>
                            <strong>${symbol}</strong><br>
                            <small>${holding.shares} shares @ $${avgPrice.toFixed(2)}</small>
                        </div>
                        <div style="text-align: right;">
                            <strong>$${currentValue.toFixed(2)}</strong><br>
                            <small class="holding-pnl" style="color: ${holdingPnl >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                ${holdingPnl >= 0 ? '+' : ''}$${holdingPnl.toFixed(2)}
                            </small>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Update transaction history
        const transactionHistory = document.getElementById('transactionHistory');
        if (portfolio.transactions.length === 0) {
            transactionHistory.innerHTML = '<p class="empty-state">No transactions yet.</p>';
        } else {
            transactionHistory.innerHTML = portfolio.transactions.map(tx => `
                <div class="transaction-item">
                    <strong class="tx-${tx.type}">${tx.type.toUpperCase()} ${tx.symbol}</strong>
                    <span>${tx.shares} shares at $${tx.price.toFixed(2)}</span>
                </div>
            `).join('');
        }
    };

    // --- QUIZ LOGIC ---
    const startQuiz = () => {
        document.getElementById('quizStart').style.display = 'none';
        document.getElementById('quizArea').style.display = 'block';
        state.quiz.currentQuestionIndex = 0;
        state.quiz.score = 0;
        displayQuestion();
    };

    const displayQuestion = () => {
        const quiz = state.quiz;
        if (quiz.currentQuestionIndex >= quiz.questions.length) {
            showQuizResults();
            return;
        }

        const question = quiz.questions[quiz.currentQuestionIndex];
        document.getElementById('currentQuestionNum').textContent = quiz.currentQuestionIndex + 1;
        document.getElementById('questionText').textContent = question.question;

        const optionsContainer = document.getElementById('quizOptions');
        optionsContainer.innerHTML = question.options.map((option, index) => 
            `<div class="quiz-option" data-index="${index}">${option}</div>`
        ).join('');
        
        optionsContainer.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', selectAnswer);
        });

        document.getElementById('quizFeedback').textContent = '';
        document.getElementById('nextQuestionBtn').style.display = 'none';
        
        const progress = ((quiz.currentQuestionIndex) / quiz.questions.length) * 100;
        document.getElementById('quizProgress').style.width = `${progress}%`;
    };

    const selectAnswer = (e) => {
        const selectedOption = e.target;
        const selectedIndex = parseInt(selectedOption.dataset.index);
        const question = state.quiz.questions[state.quiz.currentQuestionIndex];
        const correctIndex = question.correct;

        document.querySelectorAll('.quiz-option').forEach(option => {
            option.removeEventListener('click', selectAnswer); // Prevent multiple clicks
        });

        if (selectedIndex === correctIndex) {
            selectedOption.classList.add('correct');
            document.getElementById('quizFeedback').textContent = "Correct!";
            document.getElementById('quizFeedback').style.color = 'var(--success-color)';
            state.quiz.score++;
        } else {
            selectedOption.classList.add('incorrect');
            document.getElementById(quizOptions).children[correctIndex].classList.add('correct');
            document.getElementById('quizFeedback').textContent = "Not quite!";
            document.getElementById('quizFeedback').style.color = 'var(--danger-color)';
        }

        document.getElementById('nextQuestionBtn').style.display = 'block';
    };

    const nextQuestion = () => {
        state.quiz.currentQuestionIndex++;
        displayQuestion();
    };

    const showQuizResults = () => {
        document.getElementById('quizArea').style.display = 'none';
        document.getElementById('quizResults').style.display = 'block';
        
        const finalScore = Math.round((state.quiz.score / state.quiz.questions.length) * 100);
        document.getElementById('finalScore').textContent = `${finalScore}%`;
        
        let resultText = "Good effort! Keep learning and practicing.";
        if (finalScore > 90) resultText = "Excellent! You're a true investing pro!";
        else if (finalScore > 70) resultText = "Great job! You have a solid understanding.";
        document.getElementById('quizResultText').textContent = resultText;
        
        // Update learning progress
        state.learningProgress = Math.max(state.learningProgress, finalScore);
        document.getElementById('learningProgress').style.width = `${state.learningProgress}%`;
        document.getElementById('progressText').textContent = `Progress: ${state.learningProgress}% Complete`;
    };

    window.restartQuiz = () => {
        document.getElementById('quizResults').style.display = 'none';
        document.getElementById('quizStart').style.display = 'block';
    };

    // --- NOTIFICATION ---
    const showNotification = (message, type = 'info') => {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };

    // --- Let's Go! ---
    init();
});
