package com.hyperchain.contract.setHash.logic;

import cn.hyperchain.annotations.StoreField;
import cn.hyperchain.contract.BaseContract;
import cn.hyperchain.core.HyperMap;


public class SetHashContract extends BaseContract implements IsetHash, IsetHashWithEvent, IsetHashType {

    public SetHashContract(){}

    @StoreField
    private HyperMap<String,Object> map = new HyperMap();

//    HashMap
    @Override
    public boolean setHash(String key,Object obj) {
        map.put(key,obj);
        event(key,"event","sethash");
        return true;
    }

    @Override
    public int getSize() {
        return map.size();
    }

    @Override
    public boolean setHashWithEvent(String key, Object value) {
        map.put(key,value);
        event(key,"event","sethash");
        return true;
    }

    @Override
    public void setHashExtra(){
        String key = getValueFromExtra("key");
        String value = getValueFromExtra("value");
        map.put(key,value);
    }

    @Override
    public void setHashExtraSplit(){
        String data = getValueFromExtra("data");
        String[] datas = data.split("@");
        map.put(datas[0],datas[1]);
    }

    @Override
    public void setHashNoRet(String key,String value){
        map.put(key,value);
    }

    public void a(){}


    public void forTime(int times){
        int temp = 1;
        for (int i = 0; i < times; i++) {
            temp = temp+1;
            temp = temp-1;
            temp = temp* temp;
            temp = temp/ temp;
        }

    }

}
