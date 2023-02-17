package com.hyperchain.contract.setHash.invoke;

import cn.hyperchain.contract.BaseInvoke;
import com.hyperchain.contract.setHash.logic.IsetHashWithEvent;

public class SetHashWithEventInvoke implements BaseInvoke<String, IsetHashWithEvent> {

    public SetHashWithEventInvoke(){}
    private String key;
    private Object value;

    public SetHashWithEventInvoke(String key, Object value) {
        this.key = key;
        this.value = value;
    }



    @Override
    public String invoke(IsetHashWithEvent isetHash) {
        return  ""+isetHash.setHashWithEvent(key,value);
    }
}
