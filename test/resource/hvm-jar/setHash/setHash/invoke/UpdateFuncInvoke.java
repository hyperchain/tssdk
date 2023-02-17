package com.hyperchain.contract.setHash.invoke;

import cn.hyperchain.contract.BaseInvoke;
import com.hyperchain.contract.setHash.logic.IupdateFunc;

public class UpdateFuncInvoke implements BaseInvoke<String, IupdateFunc>{
    public UpdateFuncInvoke(){}

    @Override
    public String invoke(IupdateFunc iupdateFunc) {
        return iupdateFunc.updateFunc();
    }
}
