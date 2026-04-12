package com.hallbooking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hallbooking.dao.impl.ClickRepositoryImpl;
import com.hallbooking.model.*;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
public class ItemProcessor {

	@Autowired
	private ClickRepositoryImpl itemDetailsDao;
	
	/**
	 * Method to fetch Item details based on Item Id
	 * @param itemId
	 * @return Item
	 */
	public Item retrieveItemDetails(String itemId) {

		//call the dao for fetching the item details
		Item item = new Item();
		if(!StringUtils.isEmpty(itemId)) {
			item = itemDetailsDao.fetchItemDetails(itemId);
		}
		return item;
	}

	/**
	 * Alias method for retrieveItemDetails
	 * @param itemId
	 * @return Item
	 */
	public Item getItemById(String itemId) {
		return retrieveItemDetails(itemId);
	}
	
	public List<Item> getItemsBasedOnVendorId(String vendorId, Pageable pageable) {
		return itemDetailsDao.getItemsBasedOnVendorId(vendorId,pageable);
	}
	/**
	 * Method to fetch items based on Type and place
	 * @param item
	 * @return List<Item>
	 */
	public List<Item> fetchItems(Item item, Pageable pageable){
		
		List<Item> itemDetailsList = new ArrayList<Item>();
		if(!StringUtils.isEmpty(item)) {
			itemDetailsList = itemDetailsDao.fetchItems(item);
		}
		return itemDetailsList;
	}
	/**
	 * Method to save Item Details
	 * @param itemDetails
	 * @throws JsonProcessingException
	 */
	public void insertItemDetails(Item itemDetails) throws JsonProcessingException {

		itemDetails.setCreatedBy(itemDetails.getVendorId());
		itemDetails.setCreatedOn(new Date());
		// Only set status to PENDING if not already set
		if (itemDetails.getStatus() == null || itemDetails.getStatus().isEmpty()) {
			itemDetails.setStatus("PENDING");
		}

		// Calculate subtotal if pricing is provided
		Pricing price = itemDetails.getPrice();
		if (price != null) {
			double baseRate = price.getBaseRate();
			double tax = price.getTax();
			double discount = price.getDiscount();
			double subTotal = baseRate + tax - discount;
			itemDetails.getPrice().setSubTotal(subTotal);
		}

		itemDetailsDao.insertItemDetails(itemDetails);
	}
	/**
	 * Method to update Item Details
	 * @param itemDetails
	 * @throws JsonProcessingException
	 */
	public void updateItemDetails(Item itemDetails) throws JsonProcessingException{ 
		itemDetailsDao.updateItemDetails(itemDetails); 
	}
	/**
	 * Method to filter based on the criteria
	 * @param itemSearchCriteria
	 * @return List<Item>
	 */
	public List<Item> filteredItems(ItemSearchCriteria itemSearchCriteria){
		return itemDetailsDao.filteredItems(itemSearchCriteria);
	}
	
	public List<Booking> getItemsForBookingByVendor(String vendorId) {
		return itemDetailsDao.getBookingsBasedOnVendorId(vendorId, null);//Need to change this method to fetch only the required attributes
	}
	
	public void saveImage(InputStream targetStream, String fileName) throws FileNotFoundException {
		itemDetailsDao.saveImage(targetStream, fileName);
	}
	
	public GridFsResource retrieveImages(String fileName) {
		return itemDetailsDao.retrieveImages(fileName);
	}

	public void deleteItem(String itemId) {
		itemDetailsDao.deleteItem(itemId);
	}
	 
	public void saveImageNames(String itemId, String fileName, boolean isMainImage) {
		
		Item savedItem = itemDetailsDao.fetchItemDetails(itemId);
		
		Item item = new Item();
		item.setId(itemId);
		item.setDetails(savedItem.getDetails());
		if(isMainImage) {
			ItemDetails details = savedItem.getDetails();
			details.setMainImageUrl(fileName);
			item.setDetails(details);
		}
		List<Image> imageList = savedItem.getImages() != null ? savedItem.getImages(): new ArrayList<Image>();
		Image imageDetails = new Image();
		imageDetails.setFileName(fileName);
		
		imageList.add(imageDetails);
		item.setImages(imageList);
		itemDetailsDao.saveImageNames(item);
	}
	
	/*public List<Images> getImageDetails(String itemId) {
		return itemDetailsDao.getImageDetails(itemId);
	}*/
	
}
