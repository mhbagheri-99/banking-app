import BankCard from "@/components/BankCard";
import HeaderBox from "@/components/HeaderBox";
import { getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import React from "react";

const MyBanks = async () => {
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) return null;
  const accounts = await getAccounts({ userId: loggedIn.$id });
  if (!accounts) return null;
  return (
    <section className="flex">
      <div className="my-banks">
        <HeaderBox 
          title="My Bank Accounts"
          subtext="Manage your bank accounts" 
        />
        <div className="space-y-4">
          <h2 className="header-2">
            Your Cards
          </h2>
          <div className="flex flex-wrap gap-6">
            {accounts?.data.map((account: Account) => (
              <BankCard 
                key={account.id}
                account={account}
                userName={loggedIn.firstName}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyBanks;
