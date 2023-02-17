package com.hyperchain.contract.setHash.invoke;

import cn.hyperchain.contract.BaseInvoke;
import com.hyperchain.contract.setHash.logic.IsetHash;

public class GetSizeInvoke implements BaseInvoke<Integer,IsetHash>{
    public GetSizeInvoke(){}
    @Override
    public Integer invoke(IsetHash isetHash) {
        return isetHash.getSize();
    }
}
