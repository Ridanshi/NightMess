// IngredientDialog.js
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

export default function IngredientDialog({ open, onClose, ingredients }) {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Ingredients</DialogTitle>
      <List>
        {ingredients.split(",").map((ingredient, index) => (
          <ListItem disablePadding key={index}>
            <ListItemButton>
              <ListItemAvatar>
                <Avatar>
                  <RestaurantMenuIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={ingredient.trim()} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}
