package com.hallbooking.dao.impl;

import com.hallbooking.model.City;
import com.hallbooking.model.ItemType;
import com.hallbooking.model.Places;
import com.hallbooking.model.States;
import com.hallbooking.utility.DBConstants;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CommonRepositoryImpl {

	@Autowired
	MongoTemplate mongoTemplate;
	
	public List<States> retrieveStates() {
		List<States> statesList = mongoTemplate.findAll(States.class);
		return statesList;
	}
	
	public List<City> retrieveCities(String stateId) {
		List<City> cityList = mongoTemplate.find(Query.query(
				Criteria.where(DBConstants.STATE_ID).in( new ObjectId(stateId))), City.class);
				/*List<City> cityList = mongoTemplate.find(Query.query(
				Criteria.where(DBConstants.STATE_ID).in(stateId)), City.class);*/
		
		return cityList;
	}
	
	public List<Places> retrievePlaces(String cityId) {
		List<Places> placeList = mongoTemplate.find(Query.query(
				Criteria.where(DBConstants.CITY_ID).in(new ObjectId(cityId))), Places.class);
				/*List<Places> placeList = mongoTemplate.find(Query.query(
				Criteria.where(DBConstants.CITY_ID).in(cityId)), Places.class);*/
		
		return placeList;
	}
	
	public List<ItemType> retrieveTypes() {
		List<ItemType> typesList = mongoTemplate.findAll(ItemType.class);
		return typesList;
	}
	
	public void saveStates(List<States> states) {
		mongoTemplate.insert(states, States.class);
		
	}
	
	public void saveTypes(List<ItemType> types) {
		mongoTemplate.insert(types, ItemType.class);
		
	}
}
