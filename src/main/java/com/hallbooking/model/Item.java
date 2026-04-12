package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "item")
public class Item implements Serializable{

	private String id;
	private String vendorId;
	private String placeId;
	private String type;
	private ItemDetails details;
	private Pricing price;
	private FilterDetails filter; // this can be appended with any filter that is required
	private List<ItemReviews> reviews;
	private List<Image> images;
 	private String status;
 	private Date createdOn;
 	private String createdBy;
 	private Date lastUpdatedOn;
 	private String lastUpdatedBy;
// 	private Date dateSelected;

}
