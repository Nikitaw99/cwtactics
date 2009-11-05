package com.client.state.mini;

import com.client.logic.input.Controls;
import com.client.menu.GUI.ExitDraw;
import com.client.menu.GUI.LogoDraw;
import com.client.tools.TextImgLibrary;
import org.newdawn.slick.Graphics;

/**
 * ExitMiniScr
 * The reason for the mini states is so I do not have to create a new
 * state for every window I create. This mini state creates a window
 * for the exit screen
 * @author Crecen
 */
public class ExitMiniScr {
    public boolean scrSwitch;
    public LogoDraw menuLogo;
    public int column;

    public boolean scr_mouseLock;
    public int scr_mouseScroll;
    public int scr_mouseX;
    public int scr_mouseY;
    public boolean scr_exit;
    public boolean setLock;

    private ExitDraw exitScr;

    public ExitMiniScr(TextImgLibrary txtLib, int width, int height){
        exitScr = new ExitDraw(0, 0, 0);
        exitScr.init(new String[]{"LEAVING...", "YES", "NO"}, txtLib);
        exitScr.exitMenu.setFinalPosition(
                (int)((width-exitScr.getX())/2),
                (int)((height-exitScr.getY())/2));
    }

    public void update(){
        setLock = false;
        if(scrSwitch){
            menuLogo.setText(2, "");
            menuLogo.setFinalPosition(0, 145, 50);
            //menuLogo.setFinalPosition(1, 0, 0);
            menuLogo.setFinalPosition(2, 0, 480);

            exitScr.exitMenu.select = -1;
            scrSwitch = false;
        }

        if(!scr_mouseLock)
            exitScr.exitMenu.mouseSelect(scr_mouseX, scr_mouseY);

        if(scr_mouseScroll != 0){
            setLock = true;
            exitScr.exitMenu.select *= -1;
        }

        if(Controls.isUpClicked() ||
           Controls.isDownClicked() ||
           Controls.isLeftClicked() ||
           Controls.isRightClicked()){
            exitScr.exitMenu.select *= -1;
        }
        if(Controls.isActionClicked()){
            if(exitScr.exitMenu.select == 1)
                scr_exit = true;
            else{
                if(column == -1)    column = 0;
                else                column = 1;
                scrSwitch = true;
            }
        }else if(Controls.isCancelClicked()){
            if(column == -1)    column = 0;
            else                column = 1;
            scrSwitch = true;
        }
    }

    public void render(Graphics g){
        exitScr.exitMenu.render(g);
    }
}
