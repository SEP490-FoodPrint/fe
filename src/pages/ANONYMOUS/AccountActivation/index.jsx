import React from "react"
import AuthSplitLayout from "src/components/Auth/AuthSplitLayout/AuthSplitLayout"
import ActivationForm from "./component/ActivationForm"

export default function AccountActivationPage() {
  return (
    <AuthSplitLayout cardMaxWidth={440}>
      <ActivationForm />
    </AuthSplitLayout>
  )
}
