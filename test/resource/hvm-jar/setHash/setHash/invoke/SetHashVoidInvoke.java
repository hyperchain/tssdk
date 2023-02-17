package com.hyperchain.contract.setHash.invoke;

import cn.hyperchain.contract.BaseInvoke;
import com.hyperchain.contract.setHash.logic.IsetHashType;

public class SetHashVoidInvoke  implements BaseInvoke<String, IsetHashType> {

    public SetHashVoidInvoke(){}
    private String key;
    private String value;

    public SetHashVoidInvoke(String key, String value) {
        this.key = key;
        this.value = value;
    }



    @Override
    public String invoke(IsetHashType isetHash) {
        isetHash.setHashNoRet(key,value);
        return null;
    }


}
