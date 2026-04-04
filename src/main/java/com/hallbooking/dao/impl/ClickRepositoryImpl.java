package com.hallbooking.dao.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hallbooking.dao.ItemDao;
import com.hallbooking.model.Booking;
import com.hallbooking.model.Item;
import com.hallbooking.model.ItemSearchCriteria;
import com.hallbooking.utility.DBConstants;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.List;

@Component
public class ClickRepositoryImpl implements ItemDao {

	@Autowired
	MongoTemplate mongoTemplate;

	@Autowired
	GridFsTemplate gridFsTemplate;

	GridFSBucket gridFSBucket;

	@Bean
	public GridFSBucket  getGridFSBucket(MongoDatabaseFactory mongoDatabaseFactory) {
		MongoDatabase db = mongoDatabaseFactory.getMongoDatabase();
		// Create a bucket with the default name "fs"
		gridFSBucket = GridFSBuckets.create(db);
		return gridFSBucket;
	}

	// --------------------------------------------------------------------------------------------------------------------//

	@Override
	public List<Item> fetchItems(Item item) {

		List<Item> itemList = mongoTemplate.find(Query.query(Criteria.where(DBConstants.ITEM_TYPE).in(item.getType())
				.and(DBConstants.ITEM_PLACE_ID).is(item.getPlaceId())), Item.class);

		return itemList;
	}

	/**
	 * Method to insert a new item details
	 * 
	 */
	public void insertItemDetails(Item itemDetails) throws JsonProcessingException {

		mongoTemplate.save(itemDetails);
	}

	/**
	 * Method to update item details
	 * 
	 */
	public void updateItemDetails(Item itemDetails) throws JsonProcessingException {

		Query updateQuery = new Query();
		updateQuery.addCriteria(Criteria.where(DBConstants.ITEM_ID).is(new ObjectId(itemDetails.getId())));

		Update update = new Update();

		update.set(DBConstants.ITEM_TYPE, itemDetails.getType());
		update.set(DBConstants.ITEM_DETAILS, itemDetails.getDetails());
		update.set(DBConstants.ITEM_PRICE, itemDetails.getPrice());
		update.set(DBConstants.ITEM_FILTER, itemDetails.getFilter());
		update.set(DBConstants.ITEM_REVIEWS, itemDetails.getReviews());
		update.set(DBConstants.ITEM_LASTUPDATEDBY, itemDetails.getLastUpdatedBy());
		update.set(DBConstants.ITEM_LASTUPDATEDON, itemDetails.getLastUpdatedOn());

		mongoTemplate.updateFirst(updateQuery, update, Item.class);
	}

	@Override
	public List<Item> filteredItems(ItemSearchCriteria itemSearchCriteria) {

		Query filterQuery = new Query();
		Criteria criteria = new Criteria();
		boolean firstCondition = true;
		if(null != itemSearchCriteria.getType() && StringUtils.hasText(itemSearchCriteria.getType())) {
			criteria = firstCondition ? Criteria.where(DBConstants.ITEM_TYPE).is(itemSearchCriteria.getType()) : criteria.and(DBConstants.ITEM_TYPE).is(itemSearchCriteria.getType());
			firstCondition = false;
		}
		if(null != itemSearchCriteria.getPlaceId()  && StringUtils.hasText(itemSearchCriteria.getPlaceId())) {
			criteria = firstCondition ? Criteria.where(DBConstants.ITEM_PLACE_ID).is(itemSearchCriteria.getPlaceId()) : criteria.and(DBConstants.ITEM_PLACE_ID).is(itemSearchCriteria.getPlaceId());
			firstCondition = false;
		}
		if(null != itemSearchCriteria.getSeatingCapacity()) {
			criteria = firstCondition ? Criteria.where(DBConstants.ITEM_FILTER_SEATING_CAPCITY).is(itemSearchCriteria.getSeatingCapacity()) : criteria.and(DBConstants.ITEM_FILTER_SEATING_CAPCITY).is(itemSearchCriteria.getSeatingCapacity());
			firstCondition = false;
		}
		if(null != itemSearchCriteria.getTempControl()  && StringUtils.hasText(itemSearchCriteria.getTempControl())) {
			criteria = firstCondition ? Criteria.where(DBConstants.ITEM_FILTER_TEMP_CONTROL).is(itemSearchCriteria.getTempControl()) : criteria.and(DBConstants.ITEM_FILTER_TEMP_CONTROL).is(itemSearchCriteria.getTempControl());
			firstCondition = false;
		}
		filterQuery.addCriteria(criteria);

		/*filterQuery
				.addCriteria(
						Criteria.where(
								DBConstants.ITEM_TYPE).in(itemSearchCriteria.getType())
						.and(DBConstants.ITEM_PLACE_ID).is(itemSearchCriteria.getPlaceId())
						.and(DBConstants.ITEM_FILTER_SEATING_CAPCITY).gte(itemSearchCriteria.getSeatingCapacity())
						.and(DBConstants.ITEM_FILTER_TEMP_CONTROL).is(itemSearchCriteria.getTempControl()))
				.with(Sort.by(Sort.Direction.ASC, DBConstants.ITEM_DETAILS_AMOUNT));*/

		List<Item> filteredList = mongoTemplate.find(filterQuery, Item.class);
		return filteredList;
	}

	@Override
	public Item fetchItemDetails(String itemId) {

		Query filterQuery = new Query();
		filterQuery.addCriteria(Criteria.where(DBConstants.ITEM_ID).is(itemId));

		Item itemDetails = mongoTemplate.findById(itemId, Item.class);//(filterQuery, Item.class);
		return itemDetails;
	}
	
	public List<Item> getItemsBasedOnVendorId(String vendorId, Pageable pageable) {
		Query filterQuery = new Query();
		filterQuery.addCriteria(Criteria.where(DBConstants.ITEM_VENDOR_ID).is(vendorId));

		List<Item> itemDetails = mongoTemplate.find(filterQuery, Item.class);
		return itemDetails;
	}

	public List<Booking> getBookingsBasedOnVendorId(String vendorId, Pageable pageable) {
		Query filterQuery = new Query();
		filterQuery.addCriteria(Criteria.where(DBConstants.ITEM_VENDOR_ID).is(vendorId));

		List<Booking> bookingDetails = mongoTemplate.find(filterQuery, Booking.class);
		return bookingDetails;
	}


	public void deleteItem(String itemId) {

		Query query = new Query(Criteria.where("id").is(itemId));
		mongoTemplate.findAllAndRemove(query, Item.class);
	}

	public GridFsResource retrieveImages(String fileName) {
	//	GridFSFile gridFsFile = gridFsTemplate.findOne(new Query(Criteria.where("filename").is(fileName)));
		GridFSFile imageFile = gridFsTemplate.findOne(new Query(Criteria.where("filename").is(fileName)));
		if (imageFile != null) {
			// Use GridFsResource to create a resource from the GridFSFile and GridFSBucket
			return new GridFsResource(imageFile, gridFSBucket.openDownloadStream(imageFile.getObjectId()));
		}
	//	List<GridFSDBFile> imageFile = gridFsTemplate.find(new Query(Criteria.where("images.$.filename").regex(itemId)));
		
		return null;
	}
	
	public void saveImage(InputStream targetStream, String fileName) throws FileNotFoundException {
		//  InputStream targetStream = new FileInputStream(convFile);
		gridFsTemplate.store(targetStream, fileName);

	}
	
	public void saveImageNames(Item item) {
		
		Query updateQuery = new Query();
		updateQuery.addCriteria(Criteria.where(DBConstants.ITEM_ID).is(new ObjectId(item.getId())));
		
		Update update = new Update();
		/*ItemDetails details = new ItemDetails();
		details.setMainImageUrl(item.getDetails().getMainImageUrl());
		List<Image> images = new ArrayList<Image>();
		Image image = new Image();
		image.setFileName(item.getImages().get(0).getFileName());
		images.add(image);*/
		update.set(DBConstants.ITEM_IMAGES, item.getImages());
		update.set(DBConstants.ITEM_DETAILS, item.getDetails());
		
		mongoTemplate.updateFirst(updateQuery, update, Item.class);
	}
	
/*	public List<Images> getImageDetails(String itemId) {
		Query filterQuery = new Query();
		filterQuery.addCriteria(Criteria.where(DBConstants.ITEM_ID).is(itemId));
		
		return mongoTemplate.find(filterQuery, Images.class);
	}*/


}
