package com.hallbooking.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

@Component
public class UserPasswordMailProcessor {
	  
	private String processBody(String toMail) { 
		  StringBuilder email = new StringBuilder();
		  email.append("<html><body>");
		  email.append("mmmmmmmmmmmmmmmmmmmmmmmm"); 
		  email.append("<br><br>");
		  email.append("</body></html>");
	  
		  return email.toString();
	}
	  
	
//	@Autowired
 //   private JavaMailSender sender;
 
	public String sendMail(String email, String password) {
        try {
        	sendMailViaGodaddy(email, password);
            return "Email Sent!";
        }catch(Exception ex) {
            return "Error in sending email: "+ex;
        }
    }
 
   /* private void sendEmail(String emailId, String password) throws Exception{
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
         
        helper.setTo("ajithraj.in@gmail.com");
        String k = processBody("");
        helper.setText("Your password is reseted to " +password);
        
        helper.setSubject("Boogiee.com : Password Reset");
      
        try {
        	sender.send(message);
        	sendMailViaGodaddy("Test mail","test13456677");
        } catch (Exception e) {
        	e.printStackTrace();
			System.out.println("llll");
		}
    }*/
    
    public static void sendMailViaGodaddy(String emailId, String newPassword) {
        try {
        	Properties props = System.getProperties();
        	props.setProperty("mail.transport.protocol", "smtp");
        	props.setProperty("mail.host", "smtpout.secureserver.net");
	        props.put("mail.smtp.auth", "true");
        	props.setProperty("mail.user", "info@boogiee.com");
        	props.setProperty("mail.password", "m2s1v9i5!");
	 
	        Session mailSession = Session.getDefaultInstance(props, null);
	        Transport transport = mailSession.getTransport("smtp");
	        MimeMessage message = new MimeMessage(mailSession);
	        message.setSentDate(new java.util.Date());
	        message.setSubject("Boogiee.com : Password Reset");
	        message.setFrom(new InternetAddress("info@boogiee.com"));
	     /*   for (int i=0;i < to.size();i++)
	        {
	                                         
	     */ message.addRecipient(Message.RecipientType.TO, new  
	    		 InternetAddress("ajithraj.in@gmail.com"));
	     //       }
               
	     	message.setText("Your password is reseted to " +newPassword);
 
            transport.connect("smtpout.secureserver.net","info@boogiee.com","m2s1v9i5!");
            transport.sendMessage(message,
            message.getRecipients(Message.RecipientType.TO));
            transport.close();
                       
            System.out.println("Email via go daddy sent");
        } catch (Exception e) {
        	System.out.println("Failed to send Email : " + e.getMessage());
        }
   }

}
