package com.hyperchain.contract.setHash.invoke;

import cn.hyperchain.contract.BaseInvoke;
import com.hyperchain.contract.setHash.logic.IsetHash;

import java.util.ArrayList;

public class oomInvoke implements BaseInvoke<String, IsetHash>{

    @Override
    public String invoke(IsetHash isetHash) {
        for(int i=0;i<100;i++) {
            ArrayList<String> ret = new ArrayList<>(Integer.MAX_VALUE);
        }
        return null;
    }
}
