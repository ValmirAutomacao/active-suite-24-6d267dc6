import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-center py-8 text-2xl font-bold">Teste Simples</h1>
      <Routes>
        <Route path="/" element={<div className="text-center">Home funcionando!</div>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App;