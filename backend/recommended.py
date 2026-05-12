import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
from collections import defaultdict

class FoodRecommendationEngine:
    def __init__(self, orders_file='orders_data.csv'):
        self.orders_file = orders_file
        self.user_item_matrix = None
        self.item_popularity = None
        
    def load_data(self):
        """Load order data from CSV"""
        try:
            if not os.path.exists(self.orders_file):
                print("No orders data file found")
                return pd.DataFrame()
            
            df = pd.read_csv(self.orders_file)
            return df
        except Exception as e:
            print(f"Error loading data: {e}")
            return pd.DataFrame()
    
    def create_user_item_matrix(self, df):
        """Create a matrix of users and their ordered items"""
        if df.empty:
            return None
        
        # Aggregate orders by user and item
        user_item = df.groupby(['client_email', 'foodname'])['quantity'].sum().unstack(fill_value=0)
        self.user_item_matrix = user_item
        return user_item
    
    def calculate_item_popularity(self, df):
        """Calculate global item popularity"""
        if df.empty:
            return {}
        
        popularity = df.groupby('foodname')['quantity'].sum().to_dict()
        self.item_popularity = popularity
        return popularity
    
    def get_user_preferences(self, user_email, df):
        """Get user's ordering preferences"""
        user_orders = df[df['client_email'] == user_email]
        
        if user_orders.empty:
            return {
                'favorite_items': {},
                'order_count': 0,
                'total_quantity': 0,
                'ordering_frequency': 'new_user'
            }
        
        preferences = {
            'favorite_items': user_orders.groupby('foodname')['quantity'].sum().nlargest(5).to_dict(),
            'order_count': len(user_orders),
            'total_quantity': user_orders['quantity'].sum(),
            'avg_order_size': user_orders['quantity'].mean(),
            'ordering_frequency': self._calculate_frequency(user_orders)
        }
        
        return preferences
    
    def _calculate_frequency(self, user_orders):
        """Calculate how often user orders"""
        if len(user_orders) < 2:
            return "new_user"
        
        user_orders = user_orders.sort_values('order_date')
        date_diffs = pd.to_datetime(user_orders['order_date']).diff().dt.days.dropna()
        
        if date_diffs.empty:
            return "new_user"
        
        avg_days = date_diffs.mean()
        
        if avg_days <= 1:
            return "daily"
        elif avg_days <= 7:
            return "weekly"
        elif avg_days <= 30:
            return "monthly"
        else:
            return "occasional"
    
    def cosine_similarity(self, user1, user2):
        """Calculate cosine similarity between two users"""
        dot_product = np.dot(user1, user2)
        norm_user1 = np.linalg.norm(user1)
        norm_user2 = np.linalg.norm(user2)
        
        if norm_user1 == 0 or norm_user2 == 0:
            return 0
        
        return dot_product / (norm_user1 * norm_user2)
    
    def find_similar_users(self, user_email, top_n=10):
        """Find users with similar ordering patterns"""
        if self.user_item_matrix is None or user_email not in self.user_item_matrix.index:
            return []
        
        user_vector = self.user_item_matrix.loc[user_email].values
        similarities = {}
        
        for other_user in self.user_item_matrix.index:
            if other_user != user_email:
                other_vector = self.user_item_matrix.loc[other_user].values
                similarity = self.cosine_similarity(user_vector, other_vector)
                if similarity > 0:  # Only consider users with positive similarity
                    similarities[other_user] = similarity
        
        # Sort by similarity and return top N
        sorted_users = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
        return sorted_users[:top_n]
    
    def collaborative_filtering_recommendations(self, user_email, top_n=5):
        """Generate recommendations using collaborative filtering - ONLY NEW ITEMS"""
        if self.user_item_matrix is None:
            return []
        
        if user_email not in self.user_item_matrix.index:
            # New user - return popular items
            return self.get_popular_items(top_n)
        
        # Find similar users
        similar_users = self.find_similar_users(user_email, top_n=10)
        
        if not similar_users:
            return self.get_popular_items(top_n)
        
        # ✅ FIX: Get items ALREADY ORDERED by current user
        user_items = set(self.user_item_matrix.loc[user_email][self.user_item_matrix.loc[user_email] > 0].index)
        
        # Aggregate items from similar users
        recommendations = defaultdict(float)
        
        for similar_user, similarity in similar_users:
            similar_user_items = self.user_item_matrix.loc[similar_user]
            
            for item, quantity in similar_user_items.items():
                # ✅ FIX: Only recommend items user HASN'T ordered yet
                if quantity > 0 and item not in user_items:
                    # Weight by similarity score
                    recommendations[item] += quantity * similarity
        
        # Sort by weighted score
        sorted_recommendations = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
        
        return [item[0] for item in sorted_recommendations[:top_n]]
    
    def content_based_recommendations(self, user_email, df, top_n=5):
        """Generate recommendations based on user's past preferences - ONLY NEW ITEMS"""
        user_orders = df[df['client_email'] == user_email]
        
        if user_orders.empty:
            return self.get_popular_items(top_n)
        
        # ✅ FIX: Get items user has ALREADY ordered
        user_ordered_items = set(user_orders['foodname'].unique())
        
        # Get user's preferred food types
        type_counts = user_orders.groupby('type')['quantity'].sum()
        preferred_types = type_counts.nlargest(2).index.tolist()  # Get top 2 types
        
        if not preferred_types:
            # ✅ FIX: Return popular items that user hasn't ordered
            all_items = self.get_popular_items(top_n * 3)
            return [item for item in all_items if item not in user_ordered_items][:top_n]
        
        # Get items of same types that user hasn't ordered
        same_type_items = df[df['type'].isin(preferred_types)]
        
        # Calculate popularity among all users
        item_scores = same_type_items.groupby('foodname')['quantity'].sum()
        
        # ✅ FIX: Filter out items user has already ordered
        recommendations = item_scores[~item_scores.index.isin(user_ordered_items)]
        
        if recommendations.empty:
            # If no new items in preferred type, get popular items user hasn't tried
            all_items = self.get_popular_items(top_n * 3)
            return [item for item in all_items if item not in user_ordered_items][:top_n]
        
        return recommendations.nlargest(top_n).index.tolist()
    
    def hybrid_recommendations(self, user_email, df, top_n=5):
        """Combine collaborative and content-based recommendations - ONLY NEW ITEMS"""
        collab_recs = self.collaborative_filtering_recommendations(user_email, top_n * 3)
        content_recs = self.content_based_recommendations(user_email, df, top_n * 3)
        
        # ✅ Get items user has already ordered
        user_orders = df[df['client_email'] == user_email]
        user_ordered_items = set(user_orders['foodname'].unique()) if not user_orders.empty else set()
        
        # Combine with weights (60% collaborative, 40% content-based)
        scores = defaultdict(float)
        collab_weight = 0.6
        content_weight = 0.4
        
        for i, item in enumerate(collab_recs):
            # ✅ Only add items user hasn't ordered
            if item not in user_ordered_items:
                scores[item] += collab_weight * (len(collab_recs) - i)
        
        for i, item in enumerate(content_recs):
            # ✅ Only add items user hasn't ordered
            if item not in user_ordered_items:
                scores[item] += content_weight * (len(content_recs) - i)
        
        sorted_hybrid = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        result = [item[0] for item in sorted_hybrid[:top_n]]
        
        # ✅ If not enough recommendations, fill with popular items user hasn't tried
        if len(result) < top_n:
            popular = self.get_popular_items(top_n * 2)
            for item in popular:
                if item not in user_ordered_items and item not in result:
                    result.append(item)
                    if len(result) >= top_n:
                        break
        
        return result[:top_n]
    
    def get_popular_items(self, top_n=5):
        """Get globally popular items"""
        if self.item_popularity is None:
            return []
        
        sorted_items = sorted(self.item_popularity.items(), key=lambda x: x[1], reverse=True)
        return [item[0] for item in sorted_items[:top_n]]
    
    def get_trending_this_week(self, df, top_n=5):
        """Get items trending in the last 7 days"""
        if df.empty:
            return []
        
        # Filter last 7 days
        df['order_date'] = pd.to_datetime(df['order_date'])
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_orders = df[df['order_date'] >= seven_days_ago]
        
        if recent_orders.empty:
            return self.get_popular_items(top_n)
        
        trending = recent_orders.groupby('foodname')['quantity'].sum().nlargest(top_n)
        return trending.index.tolist()
    
    def generate_all_recommendations(self, user_email):
        """Generate complete recommendation set for a user"""
        df = self.load_data()
        
        if df.empty:
            return {
                'status': 'error',
                'message': 'No order data available',
                'user_email': user_email,
                'preferences': None,
                'hybrid_recommendations': [],
                'collaborative_recommendations': [],
                'content_based_recommendations': [],
                'popular_items': [],
                'trending_this_week': [],
                'similar_users': []
            }
        
        # Create matrices
        self.create_user_item_matrix(df)
        self.calculate_item_popularity(df)
        
        # Get user preferences
        preferences = self.get_user_preferences(user_email, df)
        
        # ✅ Check if user has ordered anything
        user_has_orders = preferences['order_count'] > 0
        
        # Generate different types of recommendations
        recommendations = {
            'user_email': user_email,
            'preferences': preferences,
            'hybrid_recommendations': self.hybrid_recommendations(user_email, df, top_n=5) if user_has_orders else [],
            'collaborative_recommendations': self.collaborative_filtering_recommendations(user_email, top_n=5) if user_has_orders else [],
            'content_based_recommendations': self.content_based_recommendations(user_email, df, top_n=5) if user_has_orders else [],
            'popular_items': self.get_popular_items(top_n=5),
            'trending_this_week': self.get_trending_this_week(df, top_n=5),
            'similar_users': [user for user, score in self.find_similar_users(user_email, top_n=5)] if user_has_orders else [],
            'timestamp': datetime.now().isoformat()
        }
        
        return recommendations


def main():
    """Main function to generate recommendations"""
    try:
        # Initialize recommendation engine
        engine = FoodRecommendationEngine('orders_data.csv')
        
        # Read user email from command line or config
        import sys
        if len(sys.argv) > 1:
            user_email = sys.argv[1]
        else:
            # Default test user
            user_email = "test@example.com"
        
        # Generate recommendations
        recommendations = engine.generate_all_recommendations(user_email)
        
        # Save to JSON file
        output_file = f'recommendations_{user_email.replace("@", "_").replace(".", "_")}.json'
        with open(output_file, 'w') as f:
            json.dump(recommendations, f, indent=2)
        
        print(f"Recommendations generated successfully and saved to {output_file}")
        
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        import sys
        if len(sys.argv) > 1:
            user_email = sys.argv[1]
            output_file = f'recommendations_{user_email.replace("@", "_").replace(".", "_")}.json'
        else:
            output_file = 'recommendations_error.json'
        
        # Create error output file
        with open(output_file, 'w') as f:
            json.dump({
                'status': 'error', 
                'message': str(e),
                'user_email': user_email if len(sys.argv) > 1 else 'unknown',
                'hybrid_recommendations': [],
                'popular_items': []
            }, f)


if __name__ == "__main__":
    main()