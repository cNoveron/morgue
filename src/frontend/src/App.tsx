import React, { useState, useEffect } from 'react';
import './App.css';
import { TenderlyDebugger } from './components/TenderlyDebugger';
import { TransactionAnalyzer } from './components/TransactionAnalyzer';
import { AttackStepsViewer } from './components/AttackStepsViewer';
import { CalldataViewer } from './components/CalldataViewer';
import { MemoryViewer } from './components/MemoryViewer';
import { ReturnDataViewer } from './components/ReturnDataViewer';
import { EtherscanConfig } from './components/EtherscanAPI';
import { CacheManager } from './components/CacheManager';
import { BundleSelector } from './components/BundleSelector';

interface AnalysisBundle {
  id: string;
  timestamp: number;
  txHash: string;
  transactionData: any;
  debuggerTrace: any;
  contractData: [string, string][];
  description?: string;
}

const ATTACK_TX_HASH = '0x7e7f9548f301d3dd863eac94e6190cb742ab6aa9d7730549ff743bf84cbd21d1';

function App() {
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [transactionData, setTransactionData] = useState<any>(null);
  const [debuggerTrace, setDebuggerTrace] = useState<any>(null);
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const [loadedBundle, setLoadedBundle] = useState<AnalysisBundle | null>(null);
  const [currentBundleId, setCurrentBundleId] = useState<string | null>(null);

  const handleBundleSelected = (bundle: AnalysisBundle) => {
    console.log('Loading bundle:', bundle.id);
    setLoadedBundle(bundle);
    setCurrentBundleId(bundle.id);

    // Switch to analyzer tab to show the loaded data
    setSelectedTab('analyzer');
  };

  const handleBundleSaved = (bundleId: string) => {
    setCurrentBundleId(bundleId);
    console.log('Bundle saved with ID:', bundleId);
  };

  const tabs = [
    { id: 'overview', label: 'Attack Overview' },
    { id: 'analyzer', label: 'Transaction Analyzer' },
    { id: 'steps', label: 'Attack Steps' },
    { id: 'calldata', label: 'Calldata Analysis' },
    { id: 'memory', label: 'Memory Analysis' },
    { id: 'returndata', label: 'Return Data Analysis' },
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Morgue</h1>
        <p>Toolbox for analyzing smart contract hacks post-mortem</p>
        <div className="attack-tx-info">
          <strong>Attack TX:</strong>
          <a
            href={`https://etherscan.io/tx/${ATTACK_TX_HASH}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            {ATTACK_TX_HASH}
          </a>
        </div>

        {/* API Configuration Status */}
        <div className="api-status">
          <TenderlyDebugger />
          <EtherscanConfig />
          <CacheManager />
          <BundleSelector
            onBundleSelected={handleBundleSelected}
            currentBundleId={currentBundleId || undefined}
          />
        </div>
      </header>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${selectedTab === tab.id ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {selectedTab === 'overview' && (
          <div className="overview-section">
            <h2>Setup</h2>

            <div className="setup-instructions">
              <h3>Setup Instructions</h3>
              <div className="instructions-grid">
                <div className="instruction-card">
                  <h4>1. Configure Tenderly (Required)</h4>
                  <p>Set up your Tenderly API credentials to analyze the transaction.</p>
                  <p>Without this, transaction analysis will not work.</p>
                </div>
                <div className="instruction-card">
                  <h4>2. Configure Etherscan (Optional)</h4>
                  <p>Add <code>REACT_APP_ETHERSCAN_API_KEY</code> to your .env file for better contract name resolution.</p>
                  <p>This improves the contract identification in the analysis.</p>
                </div>
                <div className="instruction-card">
                  <h4>3. Configure Infura (Optional)</h4>
                  <p>Add <code>REACT_APP_INFURA_API_KEY</code> to your .env file for more reliable blockchain data fetching.</p>
                  <p>Falls back to demo endpoints if not configured.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'analyzer' && (
          <TransactionAnalyzer
            txHash={ATTACK_TX_HASH}
            onTransactionData={setTransactionData}
            onDebuggerTrace={setDebuggerTrace}
            loadedBundle={loadedBundle}
            onBundleSaved={handleBundleSaved}
          />
        )}

        {selectedTab === 'steps' && (
          <AttackStepsViewer
            debuggerTrace={debuggerTrace}
            selectedStep={selectedStep}
            onStepSelect={setSelectedStep}
          />
        )}

        {selectedTab === 'calldata' && (
          <CalldataViewer
            debuggerTrace={debuggerTrace}
            selectedStep={selectedStep}
          />
        )}

        {selectedTab === 'memory' && (
          <MemoryViewer
            debuggerTrace={debuggerTrace}
            selectedStep={selectedStep}
          />
        )}

        {selectedTab === 'returndata' && (
          <ReturnDataViewer
            debuggerTrace={debuggerTrace}
            selectedStep={selectedStep}
          />
        )}
      </main>
    </div>
  );
}

export default App;
