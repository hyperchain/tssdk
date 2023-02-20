package com.hyperchain.contract.setHash.invoke;

import cn.hyperchain.contract.BaseInvoke;
import com.hyperchain.contract.setHash.logic.IsetHash;


public class SetHashInvoke implements BaseInvoke<String, IsetHash> {

    public SetHashInvoke(){}
    private String key;
    private Object value;

    public SetHashInvoke(String key, Object value) {
        this.key = key;
        this.value = value;
    }



    @Override
    public String invoke(IsetHash isetHash) {
        return  ""+isetHash.setHash(key,value);
    }
}
