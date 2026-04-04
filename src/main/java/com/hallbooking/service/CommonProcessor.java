package com.hallbooking.service;

import com.hallbooking.dao.impl.CommonRepositoryImpl;
import com.hallbooking.model.City;
import com.hallbooking.model.ItemType;
import com.hallbooking.model.Places;
import com.hallbooking.model.States;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CommonProcessor {

	@Autowired
	private CommonRepositoryImpl commonRepositoryImpl;
	
	public List<States> retrieveStates() {
		List<States> statesList = commonRepositoryImpl.retrieveStates();
		
		return statesList;
	}
	
	public List<City> retrieveCities(String stateId) {
		List<City> cityList = commonRepositoryImpl.retrieveCities(stateId);
		
		return cityList;
	}
	
	public List<Places> retrievePlaces(String cityId) {
		List<Places> placeList = commonRepositoryImpl.retrievePlaces(cityId);
		
		return placeList;
	}
	
	public List<ItemType> retrieveTypes() {
		List<ItemType> typeList = commonRepositoryImpl.retrieveTypes();
		
		return typeList;
	}
	
	public void saveStates(List<States> states) {
		commonRepositoryImpl.saveStates(states);
		
	}
	
	public void saveTypes(List<ItemType> types) {
		commonRepositoryImpl.saveTypes(types);
		
	}
}
