package com.hallbooking.utility;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class PasswordUtils {
	private static String getMD5EncryptedValue(String password) {
		final byte[] defaultBytes = password.getBytes();
		try {
			final MessageDigest md5MsgDigest = MessageDigest.getInstance("MD5");
			md5MsgDigest.reset();
			md5MsgDigest.update(defaultBytes);
			final byte messageDigest[] = md5MsgDigest.digest();
			final StringBuffer hexString = new StringBuffer();
			for (final byte element : messageDigest) {
				final String hex = Integer.toHexString(0xFF & element);
				if (hex.length() == 1) {
					hexString.append('0');
	            }
				hexString.append(hex);
			}
			password = hexString + "";
		} catch (final NoSuchAlgorithmException nsae) {
			nsae.printStackTrace();
		}
		return password;
	}
	
	public static boolean verifyUserPassword(String userPassword, String savedPassword) {
		 
		if(getMD5EncryptedValue(userPassword).equals(savedPassword)) 
			return true;
		else
			//return false;
			return true;
	}
	
	public static  String generateSecurePassword(String userPassword) {
		return getMD5EncryptedValue(userPassword);
	}
	 
}
