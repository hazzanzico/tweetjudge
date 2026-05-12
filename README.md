# 🧠 TweetJudge

TweetJudge is a decentralized AI-powered application that evaluates tweets using **GenLayer AI consensus**. It combines blockchain-based smart contracts with AI reasoning to provide transparent and verifiable judgments.

---

## 🚀 Features

* 🤖 AI-powered tweet evaluation
* 🔗 GenLayer smart contract integration
* 🧠 Consensus-based reasoning (not single-model AI)
* ⚡ Fast frontend built with React + Vite
* 🌐 Ready for deployment on Vercel

---

## 🏗️ Tech Stack

* Frontend: React + Vite + TypeScript
* Backend Logic: GenLayer Smart Contracts
* Network: GenLayer (Bradbury RPC)
* Deployment: Vercel

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/tweetjudge.git
cd tweetjudge
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Set up environment variables

Create a `.env` file in the root:

```bash
VITE_GENLAYER_RPC_URL=https://rpc-bradbury.genlayer.com
VITE_CONTRACT_ADDRESS=your_contract_address_here
```

---

### 4. Run locally

```bash
npm run dev
```

App will be available at:

```
http://localhost:3000
```

---

## 🌍 Deployment

This app is optimized for deployment on Vercel.

1. Push your repo to GitHub
2. Import into Vercel
3. Add environment variables:

   * `VITE_GENLAYER_RPC_URL`
   * `VITE_CONTRACT_ADDRESS`
4. Deploy 🚀

---

## 🔗 Smart Contract

The application interacts with a deployed GenLayer contract.

Make sure:

* The contract is deployed
* The address is correctly set in `.env`
* The RPC URL matches the deployment network

---

## ⚠️ Notes

* Do NOT commit `.env` files
* Always use environment variables for configuration
* Ensure you are using the correct GenLayer RPC endpoint

---

## 📄 License

MIT License

---

## 🙌 Acknowledgements

* GenLayer for decentralized AI infrastructure
* Vite & React for frontend tooling
