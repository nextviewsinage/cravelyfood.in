import FoodCard from './FoodCard';

function FoodList({ foods = [] }) {
  if (foods.length === 0) return <p style={{ color: '#777', padding: '20px 0' }}>No foods available.</p>;
  return (
    <div className="food-grid">
      {foods.map((food) => <FoodCard key={food.id} food={food} />)}
    </div>
  );
}

export default FoodList;
