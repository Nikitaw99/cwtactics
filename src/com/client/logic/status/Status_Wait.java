package com.client.logic.status;

import com.customwarsTactics.logic.states.Status_Interface;
import com.customwarsTactics.service.StatusController;
import com.system.input.Controls;
import com.client.menu.GUI.MapDraw;
import com.client.menu.logic.Menu;
import com.client.model.Fog;
import com.client.model.Move;
import com.client.model.Range;
import com.client.model.Turn;
import com.client.model.object.Game;
import com.client.model.object.Tile;
import com.client.model.object.Unit;

/**
 * Wait status class.
 * 
 * @author tapsi
 * @version 8.1.2010, #1
 */
public class Status_Wait implements Status_Interface {

	public void update(int timePassed , MapDraw map ) {
		
		// VARIABLES
    	int x = map.getCursorX();
    	int y = map.getCursorY();
    	Tile tile = Game.getMap().getTile(x, y);
    	if( tile == null ) return;
    	Unit unit = tile.getUnit();
    	StatusController.Mode mode = StatusController.getStatus();
    	
    	
    	// ACTION BUTTON
    	//
    	if( Controls.isActionClicked() ){
    		
    		// UNIT MOVE
    		if( unit != null && !Fog.inFog(tile) &&  unit.canAct() && unit.getOwner() == Turn.getPlayer() ){
    			Move.initialize(tile, unit);
    			Move.move();
    			mode = StatusController.Mode.SHOW_MOVE;
    		}
    		// FACTORY
    		else if( tile.sheet().canBuild() && !Fog.inFog(tile) && tile.getOwner() == Turn.getPlayer() ){
    			Menu.createBuildMenu(tile);
    			mode = StatusController.Mode.MENU;
    		}
    		// MAP MENU
    		else{
				Menu.createMapMenu();
				mode = StatusController.Mode.MENU;
    		}
    	}
    	
    	// CANCEL BUTTON
    	//
    	else if( Controls.isCancelDown() ){
    		
    		// SHOW RANGE OF AN UNIT
    		if( unit != null && !Fog.inFog(tile) ){
    			
    			// IF HIDDEN AND NOT VISIBLE, RETURN
    			if( unit.isHidden() && !Fog.isVisible(unit) ) return;
    			
    			Range.getCompleteAttackRange(tile, unit);
    			mode = StatusController.Mode.SHOW_RANGE;
    		}
    	}
    	
    	// SET STATUS
    	StatusController.setStatus( mode );
	}
}

