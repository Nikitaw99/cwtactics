package com.client.logic.input;

import org.newdawn.slick.Input;

import com.system.ID;
import com.system.ID.Keys;


public class Controls {

	/*
	 *
	 * VARIABLES
	 * *********
	 * 
	 */
	private final static int MOUSE_ACTION = 0;
    private final static int MOUSE_CANCEL = 1;
	private	static Input input;
		

	/*
	 *
	 * ACCESSING METHODS
	 * *****************
	 * 
	 */
	
	public static void setInput( Input input ){
		Controls.input = input;
	}
	
	
	/**
	 * Is a button clicked ? 
	 */
	public static boolean isClicked( Keys key ){
		if( input.isKeyPressed( key.value() ) )	return true;
		return false;
	}
	
	/**
	 * Is a button hold ?
	 */
	public static boolean isDown( Keys key ){
		if( input.isKeyDown( key.value() ) )	return true;
		return false;
	}
	
	/**
	 * Is a mouse button clicked ? 
	 */
	public static boolean isClicked( int keyValue ){
		if( input.isMousePressed( keyValue ))	return true;
		return false;
	}
	
	/**
	 * Is a mouse button hold ? 
	 */
	public static boolean isDown( int keyValue ){
		if( input.isMouseButtonDown( keyValue ))return true;
		return false;
	}
	
	
	
	/*
	 * 
	 * DIRECT ACCESS METHODS
	 * 
	 */
	
	// is clicked methods
	public static boolean isUpClicked(){ 		return isClicked( ID.Keys.UP ); }
	public static boolean isDownClicked(){ 		return isClicked( ID.Keys.DOWN ); }
	public static boolean isLeftClicked(){		return isClicked( ID.Keys.RIGHT ); }
	public static boolean isRightClicked(){		return isClicked( ID.Keys.LEFT ); }
	public static boolean isActionClicked(){	return (isClicked( ID.Keys.ENTER ) || isClicked(MOUSE_ACTION));}
	public static boolean isCancelClicked(){	return (isClicked( ID.Keys.CANCEL ) || isClicked(MOUSE_CANCEL));}
	// is down methods
	public static boolean isUpDown(){			return isDown( ID.Keys.UP );}
	public static boolean isDownDown(){			return isDown( ID.Keys.DOWN );}
	public static boolean isLeftDown(){			return isDown( ID.Keys.RIGHT );}
	public static boolean isRightDown(){		return isDown( ID.Keys.LEFT );}
	public static boolean isActionDown(){		return (isDown( ID.Keys.ENTER ) || isDown(MOUSE_ACTION));}
	public static boolean isCancelDown(){		return (isDown( ID.Keys.CANCEL ) || isDown(MOUSE_CANCEL));}
}

