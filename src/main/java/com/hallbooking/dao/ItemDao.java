package com.hallbooking.dao;

import com.hallbooking.model.Item;
import com.hallbooking.model.ItemSearchCriteria;

import java.util.List;

public interface ItemDao {

	public List<Item> fetchItems(Item item);
	
	public List<Item> filteredItems(ItemSearchCriteria itemSearchCriteria);
	
	public Item fetchItemDetails(String itemId);
	 
}
