package com.hallbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Image implements Serializable {

	private String fileName;
	private String createdOn;
	private String modifiedOn;
	private String createdBy;
	private String lastModifiedBy;

	
}
