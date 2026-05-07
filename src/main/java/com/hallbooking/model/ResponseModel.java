package com.hallbooking.model;

import java.io.Serializable;

public class ResponseModel<T> implements Serializable{

	private String responseMsg;
	private T data;

	public ResponseModel() {
	}

	public ResponseModel(String responseMsg) {
		this.responseMsg = responseMsg;
	}

	public ResponseModel(String responseMsg, T data) {
		this.responseMsg = responseMsg;
		this.data = data;
	}

	public String getResponseMsg() {
		return responseMsg;
	}

	public void setResponseMsg(String responseMsg) {
		this.responseMsg = responseMsg;
	}

	public T getData() {
		return data;
	}

	public void setData(T data) {
		this.data = data;
	}
}
