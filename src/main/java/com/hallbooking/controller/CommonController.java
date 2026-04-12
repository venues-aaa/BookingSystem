package com.hallbooking.controller;

import com.hallbooking.model.City;
import com.hallbooking.model.ItemType;
import com.hallbooking.model.Places;
import com.hallbooking.model.States;
import com.hallbooking.service.CommonProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//@CrossOrigin(origins="http://localhost:8081", maxAge = 3600)
//@CrossOrigin(origins="https://testclickui.azurewebsites.net", maxAge = 3600)
@RequestMapping("/common")
public class CommonController {
	
	public static final Logger logger = LoggerFactory.getLogger(CommonController.class);
	@Autowired
	private CommonProcessor commonProcessor;;
	

	@GetMapping("/states")
 	public List<States> retrieveStates() {
    	
    	List<States> states = commonProcessor.retrieveStates();
        return states;
    }
	
	@GetMapping("/cities/{stateId}")
	public List<City> retrieveCities(@PathVariable("stateId") String stateId) {
    	
    	List<City> cities = commonProcessor.retrieveCities(stateId);
        return cities;
    }
	
	@RequestMapping(value ="/places/{cityId}", produces= {"application/json"}, method = {RequestMethod.GET})
    @ResponseBody
	public List<Places> retrievePlaces(@PathVariable("cityId") String cityId) {
    	
    	List<Places> placesList = commonProcessor.retrievePlaces(cityId);
        return placesList;
    }
	
	@GetMapping("/types")
	public List<ItemType> retrieveTypes() {
    	
    	List<ItemType> typeList = commonProcessor.retrieveTypes();
        return typeList;
    }
	
	@PostMapping("/states/save")
	public void saveStates(@RequestBody List<States> states) {
    	
    	commonProcessor.saveStates(states);
        System.out.println("saved...");
    }
	
	@PostMapping("/type/save")
	public void saveTypes(@RequestBody List<ItemType> types) {
    	
    	commonProcessor.saveTypes(types);
        System.out.println("saved...");
    }
	

}
