package com.client.menu.GUI.tools;

import com.system.data.ImgData;
import com.system.data.ImgDataParser;
import com.system.data.ImgFile;
import com.client.tools.ImgLibrary;
import java.awt.Color;
import java.util.ArrayList;
import java.util.HashMap;
import org.newdawn.slick.Image;

/**
 * This class makes ImgData worth while by turning its data into
 * animated pictures. All you need to know is the name of the
 * picture and the location, and it'll give an updated animated
 * image in the render function.
 * @author Crecen
 */
public class PixAnimate {
    private final int BASE = 32;

    private ImgLibrary storedImg;
    private ArrayList<Integer> buildColors;
    private ArrayList<Integer> unitColors;
    private HashMap<Short, Integer> imgMap;
    private double scale;

    public PixAnimate(){
        storedImg = new ImgLibrary();
        buildColors = new ArrayList<Integer>();
        unitColors = new ArrayList<Integer>();
        scale = 1.0;
        imgMap = new HashMap<Short, Integer>();
        ImgDataParser.init();
    }

    public void addBuildingChange(String filePath){
        buildColors = colorChange(filePath);
    }

    public void addUnitChange(String filePath){
        unitColors = colorChange(filePath);
    }

    public void addPreferredItem(String code, String type){
        ImgDataParser.addForceType(code, type);
    }

    public void clearData(){
        ImgDataParser.clearData();
    }

    public void loadData(){
        ImgDataParser.decodeFiles();       
    }

    public ArrayList<String> getTypes(){
        return ImgDataParser.getTypes();
    }

    public ArrayList<ImgData> getData(){
        return ImgDataParser.getData();
    }

    public void changeScale(int tileBase){
        if(tileBase > 0)
            scale = (double)tileBase/BASE;
        imgMap.clear();
    }

    public double getScale(){
        return scale;
    }

    public AnimStore getImgPart(String name, int player, int direction){
        int nameItem = -1;
        byte[] anim = new byte[0];
        for(int i = 0; i < ImgDataParser.getData().size(); i++){
            ImgData data = ImgDataParser.getData().get(i);
            if(name.matches(data.group+".*") && data.direction == direction){
                nameItem = i;
                anim = new byte[data.animRef.size()];
                for(int j = 0; j < anim.length; j++)
                    anim[j] = data.animRef.get(j);
                break;
            }
        }
        if(nameItem == -1)  return null;
        return new AnimStore(nameItem, player, direction,
                anim, 0, 0);
    }

    public Image getImage(AnimStore item, int animTime){
        return storedImg.getSlickImage(imgMap.get(
                item.getAnimation(animTime)));
    }

    public void makeNewImage(AnimStore item){
        if(item != null)    makeNewImage(item.ind, item.owner, item.dir);
    }

    private ArrayList<Integer> colorChange(String filePath){
        ArrayList<Integer> newColors = new ArrayList<Integer>();
        ImgLibrary temp = new ImgLibrary();
        temp.addImage(filePath);
        int[] tempColors = temp.getPixels(0);
        for(int i = 0; i < tempColors.length/(temp.getX(0)*2); i++){
            for(int j = 1; j < (temp.getX(0)-1); j++)
                newColors.add(new Color(tempColors[
                        (i*temp.getX(0)*2)+temp.getX(0)+j]).getRGB());
        }
        return newColors;
    }


    private void makeNewImage(int index, int player, int direction){
        short store = (short)((index*10000+player*100+direction)*100);
        if(imgMap.containsKey(store))       return;

        ImgLibrary parseImg = new ImgLibrary();
        ImgData data = ImgDataParser.getData().get(index);
        for(int i = 0; i < data.imgFileRef.size(); i++){
            ImgFile file = data.imgFileRef.get(i);
            parseImg.addImage(0, file.filename);
            if(file.flipEdit != 0){
                if(file.flipEdit == 1 || file.flipEdit == 4 ||
                        file.flipEdit == 5 || file.flipEdit == 7)
                    storedImg.setRotateNinety();
                if(file.flipEdit == 2 || file.flipEdit == 4 ||
                        file.flipEdit == 6 || file.flipEdit == 7)
                    storedImg.setFlipX();
                if(file.flipEdit == 3 || file.flipEdit == 5 ||
                        file.flipEdit == 6 || file.flipEdit == 7)
                    storedImg.setFlipY();
            }
            for(int j = 0; j < data.dfltColors.size(); j++){
                if((data.code == data.UNIT || data.code == data.ARROW) &&
                        j+data.dfltColors.size()*player < unitColors.size()){
                    storedImg.setPixelChange(
                        new Color(data.dfltColors.get(j)),
                        new Color(unitColors.get(
                        j+data.dfltColors.size()*player).intValue()));
                }else if(data.code == data.PROPERTY &&
                        j+data.dfltColors.size()*player < buildColors.size()){
                    storedImg.setPixelChange(
                        new Color(data.dfltColors.get(j)),
                        new Color(buildColors.get(
                        j+data.dfltColors.size()*player).intValue()));
                }
            }
            storedImg.setImageSize(
                (int)(file.sizex*(BASE/(double)file.sizex)*file.tilex*scale),
                (int)(file.sizey*(BASE/(double)file.sizex)*file.tiley*scale));
            imgMap.put((short)(store+i), storedImg.length());
            storedImg.addImage(parseImg.getImage(0, file.locx, file.locy,
                file.sizex, file.sizey));
        }
    }
}
