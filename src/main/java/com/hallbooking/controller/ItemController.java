package com.hallbooking.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hallbooking.exception.CustomException;
import com.hallbooking.model.Booking;
import com.hallbooking.model.Item;
import com.hallbooking.model.ItemSearchCriteria;
import com.hallbooking.service.AvailabilityProcessor;
import com.hallbooking.service.ItemProcessor;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.*;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@RestController
//@CrossOrigin(origins="http://localhost:8081", maxAge=3600)
@RequestMapping("/item")
public class ItemController {
 
    public static final Logger logger = LoggerFactory.getLogger(ItemController.class);
 
    @Autowired
    AvailabilityProcessor avaliabilityProcessor; //Service which will do all data retrieval/manipulation work
    @Autowired
    ItemProcessor itemProcessor;

    @GetMapping("/")
    public ResponseEntity<String> heartbeat() {
        System.out.println("Inside heartbeat - ItemService");

        return ResponseEntity.status(HttpStatus.OK).body("Success - ItemService is Up and Running");
    }
    /*---------------------------- Item Details --------------------------------------------------------------------*/

    /**
     * Method to fetch all items based on type
     * @param item
     * @return
     * @throws CustomException
     */
    @PostMapping("/fetch")
    public ResponseEntity<Map<String, Object>> getItems(@RequestBody Item item,   @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "10") int size,
                                               @RequestParam(defaultValue = "sortBy") String sortBy) throws CustomException {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());

        if(false){
    		throw new CustomException();
    	} else {
    		List<Item> itemDetailsList = itemProcessor.fetchItems(item, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("halls", itemDetailsList);
           /* response.put("currentPage", halls.getNumber());
            response.put("totalPages", halls.getTotalPages());
            response.put("totalElements", halls.getTotalElements());*/

            return ResponseEntity.ok(response);
    	}
    }
    /**
     * Method to filter results based on the criteria
     * @param itemSearchCriteria
     * @return List<Item>
     * @throws CustomException
     */
    @PostMapping("/filter")
    public ResponseEntity<Map<String, Object>> getFilteredItems(@RequestBody ItemSearchCriteria itemSearchCriteria) throws CustomException {
     
    	if(false){
    		throw new CustomException();
    	} else {
    		List<Item> itemDetailsList = itemProcessor.filteredItems(itemSearchCriteria);
            Map<String, Object> response = new HashMap<>();
            response.put("halls", itemDetailsList);
           /* response.put("currentPage", halls.getNumber());
            response.put("totalPages", halls.getTotalPages());
            response.put("totalElements", halls.getTotalElements());*/

            return ResponseEntity.ok(response);
    	}
    }
    
    /**
     * Method to fetch item details based on itemId
     * @param itemId
     * @return
     */
    @GetMapping("/{itemId}")
    public ResponseEntity<Map<String, Object>> getItemDetails(@PathVariable("itemId") String itemId) {
     
    	Item itemDetails = itemProcessor.retrieveItemDetails(itemId);
        Map<String, Object> response = new HashMap<>();
        response.put("halls", itemDetails);
           /* response.put("currentPage", halls.getNumber());
            response.put("totalPages", halls.getTotalPages());
            response.put("totalElements", halls.getTotalElements());*/

        return ResponseEntity.ok(response);
    }
    
    /**
     * Method to fetch item details based on itemId
     * @param vendorId
     * @return
     */
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<Map<String, Object>> getItemsBasedOnVendorId(@PathVariable("vendorId") String vendorId,
                                                                       @RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "10") int size,
                                                                       @RequestParam(defaultValue = "sortBy") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
    	List<Item> itemDetailsList = itemProcessor.getItemsBasedOnVendorId(vendorId, pageable);
        Map<String, Object> response = new HashMap<>();
        response.put("halls", itemDetailsList);
           /* response.put("currentPage", halls.getNumber());
            response.put("totalPages", halls.getTotalPages());
            response.put("totalElements", halls.getTotalElements());*/

        return ResponseEntity.ok(response);
    }
    
    /**
     * Method to insert a new item
     * @param itemDetails
     * @return
     * @throws JsonProcessingException
     */
    @PostMapping("/create")
    public ResponseEntity<Item> createItem(@RequestBody Item itemDetails) throws JsonProcessingException {
       
    	itemProcessor.insertItemDetails(itemDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(itemDetails);
    }
    
    /**
     * Method to update item details
     * @param itemDetails
     * @return
     * @throws JsonProcessingException
     */
    @PutMapping("/update")
    public ResponseEntity<Item> updateItem(@RequestBody Item itemDetails) throws JsonProcessingException {
        System.out.println("=== UPDATE ITEM REQUEST ===");
        System.out.println("Item ID: " + itemDetails.getId());
        System.out.println("Item Type: " + itemDetails.getType());
        System.out.println("Item Details: " + itemDetails.getDetails());
        System.out.println("Item Price: " + itemDetails.getPrice());

        try {
            itemProcessor.updateItemDetails(itemDetails);
            System.out.println("=== UPDATE SUCCESSFUL ===");
            return ResponseEntity.status(HttpStatus.OK).body(itemDetails);
        } catch (Exception e) {
            System.err.println("=== UPDATE FAILED ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    ///Need to implement the logic..Need to check the booking status when deactivate and send mail to all concerned...
    public void updateItemStatus(@RequestBody Item itemDetails) throws JsonProcessingException {
        
    	itemProcessor.updateItemDetails(itemDetails);
    }
   
    
    //Not being used now...Need to change the existing with this
    /**
     * Method to retrieve booked details based on vendorId
     * @param vendorId
     * @return List<Booking>
     */
    @GetMapping("/itemBooking/{vendorId}")
    public ResponseEntity<Map<String, Object>> getItemsForBookingByVendor(@PathVariable("vendorId") String vendorId) {
       
    	List<Booking> bookingList = itemProcessor.getItemsForBookingByVendor(vendorId);
        Map<String, Object> response = new HashMap<>();
        response.put("halls", bookingList);
           /* response.put("currentPage", halls.getNumber());
            response.put("totalPages", halls.getTotalPages());
            response.put("totalElements", halls.getTotalElements());*/

        return ResponseEntity.ok(response);
    }

    
	@PostMapping("/image/upload/{itemId}/{mainImageUrl}"/*
																		 * ,
																		 * consumes=MediaType.MULTIPART_FORM_DATA_VALUE
																		 */)
    public ResponseEntity<Item> imageUpload(@PathVariable("itemId") String itemId, @PathVariable("mainImageUrl") boolean isMainImage, MultipartHttpServletRequest request, HttpServletResponse response)
    		throws IllegalStateException, IOException {
	
		Iterator<String> itr = request.getFileNames();
		java.util.Map<String, String[]> ParameterMap=request.getParameterMap();
	    MultipartFile file=null;

	    while (itr.hasNext()) {
	        file = request.getFile(itr.next());
	        String fileName = file.getOriginalFilename();//request.getParameter("filename");

	        String location = System.getProperty("user.dir");
			location = location + "/src/main/resources/";
			File pathFile = new File(location);
			//create the actual file
			pathFile = new File(location + fileName);
			//save the actual file
			try {
				file.transferTo(pathFile);   
			}catch(Exception e) {
				System.out.println("lllll");
			}
			InputStream inputStream = new FileInputStream(location+fileName);
	        itemProcessor.saveImageNames(itemId, fileName, isMainImage);
		   	itemProcessor.saveImage(inputStream, fileName);
	    }
		
    	return null;
    }
	
	@GetMapping("/image/retrieve/{fileName}")
	public void retrieveImage(@PathVariable("fileName") String fileName, HttpServletResponse response) throws IllegalStateException, IOException {
        GridFsResource imageForOutput =  (GridFsResource) itemProcessor.retrieveImages(fileName);
		
		//kk.writeTo("C:/projects/kk.jpg");
		
		 InputStream is = imageForOutput.getInputStream();
         ByteArrayOutputStream buffer = new ByteArrayOutputStream();
         int nRead;
         byte[] data = new byte[16384];
         while ((nRead = is.read(data, 0, data.length)) != -1) {
             buffer.write(data, 0, nRead);
         }
         buffer.flush();
         byte[]imagenEnBytes = buffer.toByteArray();

         response.setHeader("Accept-ranges","bytes");
         response.setContentType( "image/jpeg" );
         response.setContentLength(imagenEnBytes.length);
         response.setHeader("Expires","0");
         response.setHeader("Cache-Control","must-revalidate, post-check=0, pre-check=0");
         response.setHeader("Content-Description","File Transfer");
         response.setHeader("Content-Transfer-Encoding:","binary");

         OutputStream out = response.getOutputStream();
         out.write( imagenEnBytes );
         out.flush();
         out.close();
		
     }

	/*@GetMapping("/imageNames/{itemId}")
    public ResponseEntity<List<Images>> getImageDetails(@PathVariable("itemId") String itemId) {
       
    	List<Images> itemList = itemProcessor.getImageDetails(itemId);
    	return itemList;
    }*/

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> deleteItem(
            @PathVariable String itemId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Verify the hall belongs to this vendor
        /*ItemResponse hall = hallService.getHallById(id);
        if (!vendor.getId().equals(hall.getCreatedById())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only delete halls that you created"));
        }*/

        itemProcessor.deleteItem(itemId);
        return ResponseEntity.ok(Map.of("message", "Hall deleted successfully"));
    }


 
}
