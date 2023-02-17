package com.hyperchain.contract.setHash.logic;

import cn.hyperchain.contract.BaseContractInterface;

public interface IsetHashWithEvent extends BaseContractInterface{

    public boolean setHashWithEvent(String key, Object value);
}
