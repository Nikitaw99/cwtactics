package com.client.menu.GUI;

import com.client.tools.ImgLibrary;
import java.util.Random;
import org.newdawn.slick.Graphics;
import org.newdawn.slick.Image;

/**
 * BGPicture
 * This stores and draws a random background picture for the menus
 * @author Crecen
 */
public class BGPicture {
    private Image bgImage;
    private Random generator;
    private int sizeX;
    private int sizeY;

    //Use in Slick init();
    public BGPicture(String[] imgRefs, int sizex, int sizey){
        sizeX = sizex;
        sizeY = sizey;
        bgImage = null;
        setRandomImage(imgRefs);
    }

    //Use in Slick init();
    public void setRandomImage(String[] pics){
        generator = new Random();
        int random = generator.nextInt(pics.length);
        setImage(pics[random]);
    }

    //Use in Slick init();
    public void setImage(String imgRef){
        ImgLibrary tempImg = new ImgLibrary();
        tempImg.setImageSize(sizeX, sizeY);
        tempImg.addImage(imgRef);
        bgImage = tempImg.getSlickImage(imgRef);
    }

    //Use in Slick render();
    public void render(Graphics g){
        if(bgImage != null)
            g.drawImage(bgImage, 0, 0);
    }

}
