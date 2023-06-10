import './App.css';
import {Routes, Route} from 'react-router-dom'
import RecipeDashboard from './components/RecipeDashboard';
import RecipeData from './components/RecipeData'
import LandingPage from './components/LandingPage';
import DynamicForm from './components/DynamicForm';
import NotFound from './components/NotFound';
import HomePage from './components/HomePage';
import ViewRecipe from './components/ViewRecipe';
import APITest from './components/APITest';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route element={<HomePage/>} path=""/>
        <Route element={<LandingPage/>} path="home/:id"/>
        <Route element={<RecipeDashboard/>} path="myrecipes/:id"/>
        <Route element={<DynamicForm/>} path="recipe/new/:id"/>
        <Route element={<RecipeData/>} path="recipe/:userId/:recipeId"/>
        <Route element={<ViewRecipe/>} path="recipe/:userId/:recipeId/view"/>
        <Route element={<NotFound/>} path="*"/>
        <Route element={<APITest/>} path="api/:userId"/>
      </Routes>
      
    </div>
  );
}

export default App;
