import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components-v2/Layout/DashboardLayout';
import DashboardHome from './components-v2/Dashboard/DashboardHome';
import Login from './components-v2/Login/Login';

import CallRegister from './components-v2/CallMaster/CallRegister';
import PendingCalls from './components-v2/CallMaster/PendingCalls';
import ClosedCalls from './components-v2/CallMaster/ClosedCalls';
import CreateCall from './components-v2/CallMaster/CreateCall';
import CallUpdate from './components-v2/CallMaster/CallUpdate';
import CallAssign from './components-v2/CallMaster/CallAssign';
import CallDetails from './components-v2/CallMaster/CallDetails';

// Stock Management
import AllStock from './components-v2/StockManagement/AllStock';
import CurrentStock from './components-v2/StockManagement/CurrentStock';
import StockEntry from './components-v2/StockManagement/StockEntry';
import OfficeRepair from './components-v2/StockManagement/OfficeRepair';
import BranchStockList from './components-v2/StockManagement/BranchStockList';
import BranchStockEntry from './components-v2/StockManagement/BranchStockEntry';

// ManPower Module
import AllEmployee from './components-v2/ManPower/AllEmployee';
import ManpowerEntry from './components-v2/ManPower/ManpowerEntry';
import ManpowerInfo from './components-v2/ManPower/ManpowerInfo';

// Part Transaction
import BranchToEngineer from './components-v2/PartTransaction/BranchToEngineer';
import EngineerToBranch from './components-v2/PartTransaction/EngineerToBranch';
import PartTransactionDetail from './components-v2/PartTransaction/PartTransactionDetail';

// Expense
import ExpenseEntry from './components-v2/Expense/ExpenseEntry';
import ExpenseList from './components-v2/Expense/ExpenseList';

function ModernApp() {
  const token = sessionStorage.getItem("accessToken");

  if (!token) {
    return (
      <Routes>
        <Route path="/v2/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/v2/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/v2" element={<DashboardLayout />}>
        <Route path="dashboard" element={<DashboardHome />} />
        {/* Call Master Routes */}
        <Route path="call-master" element={<Navigate to="/v2/call-master/register" replace />} />
        <Route path="call-master/register" element={<CallRegister />} />
        <Route path="call-master/pending" element={<PendingCalls />} />
        <Route path="call-master/closed" element={<ClosedCalls />} />
        <Route path="call-master/create" element={<CreateCall />} />
        <Route path="call-master/update" element={<CallUpdate />} />
        <Route path="call-master/assign" element={<CallAssign />} />
        <Route path="call-master/details" element={<CallDetails />} />

        {/* Stock Management Routes */}
        <Route path="stock" element={<Navigate to="/v2/stock/all" replace />} />
        <Route path="stock/all" element={<AllStock />} />
        <Route path="stock/current" element={<CurrentStock />} />
        <Route path="stock/entry" element={<StockEntry />} />
        <Route path="stock/office-repair" element={<OfficeRepair />} />
        <Route path="stock/branch-list" element={<BranchStockList />} />
        <Route path="stock/branch-entry" element={<BranchStockEntry />} />

        {/* Man Power Routes */}
        <Route path="man-power" element={<Navigate to="/v2/man-power/all" replace />} />
        <Route path="man-power/all" element={<AllEmployee />} />
        <Route path="man-power/entry" element={<ManpowerEntry />} />
        <Route path="man-power/info" element={<ManpowerInfo />} />

        {/* Part Transaction Routes */}
        <Route path="part-transaction" element={<Navigate to="/v2/part-transaction/details" replace />} />
        <Route path="part-transaction/b2e" element={<BranchToEngineer />} />
        <Route path="part-transaction/e2b" element={<EngineerToBranch />} />
        <Route path="part-transaction/details" element={<PartTransactionDetail />} />

        {/* Expense Routes */}
        <Route path="expense" element={<Navigate to="/v2/expense/list" replace />} />
        <Route path="expense/entry" element={<ExpenseEntry />} />
        <Route path="expense/list" element={<ExpenseList />} />
        
        {/* Redirect unknown /v2 routes to dashboard */}
        <Route path="*" element={<Navigate to="/v2/dashboard" replace />} />
      </Route>
      
      {/* Root redirects to /v2/dashboard */}
      <Route path="*" element={<Navigate to="/v2/dashboard" replace />} />
    </Routes>
  );
}

export default ModernApp;
