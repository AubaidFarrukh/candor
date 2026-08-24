import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation CreateUser(
    $name: String!
    $phone: String!
    $email: String!
    $birthday: String!
    $password: String!
  ) {
    CreateUser(
      name: $name
      phone: $phone
      email: $email
      birthday: $birthday
      password: $password
    ) {
      _id
      auth_token
      birthday
      email
      name
      phone
      username
      is_premium
      referral
      is_snap_logged_in
      snapchat_bitmoji
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation SendForgotPasswordResetEmail($email: String) {
    SendForgotPasswordResetEmail(email: $email) {
      json
      message
      status
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ChangePasswordWithPasswordReset($otp: Int!, $password: String!) {
    ChangePasswordWithPasswordReset(otp: $otp, password: $password) {
      message
      status
    }
  }
`;

export const CREATE_POLL = gql`
  mutation CreatePoll($text: String!, $bragName: String, $isPremium: Boolean) {
    CreatePoll(text: $text, brag_name: $bragName, is_premium: $isPremium) {
      _id
      brag_name
      isVoted
      is_selected
      is_paid
      status
      week_title
      text
    }
  }
`;

export const UPVOTE_POLL = gql`
  mutation UpVotePoll($upVotePollId: String!) {
    UpVotePoll(id: $upVotePollId) {
      json
      message
      status
    }
  }
`;

export const MARK_READ = gql`
  mutation MarkMessageAsRead($markMessageAsReadId: String!) {
    MarkMessageAsRead(id: $markMessageAsReadId) {
      message
      status
      json
    }
  }
`;

export const MARK_REPLIED = gql`
  mutation MarkMessageAsReplied($markMessageAsRepliedId: String!) {
    MarkMessageAsReplied(id: $markMessageAsRepliedId) {
      json
      message
      status
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($deleteMessageId: String!) {
    DeleteMessage(id: $deleteMessageId) {
      json
      message
      status
    }
  }
`;

export const DELETE_MESSAGE_AND_BLOCK_SENDER = gql`
  mutation DeleteMessageAndBlockSender(
    $deleteMessageId: String!
    $temporarySenderUserId: String!
  ) {
    DeleteMessage(id: $deleteMessageId) {
      json
      message
      status
    }
    BlockSender(temporary_sender_user_id: $temporarySenderUserId) {
      message
      status
    }
  }
`;

export const DELETE_AND_BLOCK_CHAT = gql`
  mutation DeleteDMThread(
    $msgToken: String!
    $anonymousUserId: String!
    $temporarySenderUserId: String!
    $reason: String
  ) {
    DeleteDMThread(msg_token: $msgToken, anonymous_user_id: $anonymousUserId) {
      status
      json
      message
    }
    BlockSender(
      temporary_sender_user_id: $temporarySenderUserId
      reason: $reason
    ) {
      status
      message
      json
    }
  }
`;

export const UPDATE_FCM_TOKEN = gql`
  mutation UpdateUserFCMToken($fcmToken: String!, $device: String!) {
    UpdateUserFCMToken(fcm_token: $fcmToken, device: $device) {
      json
      message
      status
    }
  }
`;

export const UPDATE_USER_PASSWORD = gql`
  mutation UpdatePassword($oldPassword: String!, $newPassword: String!) {
    UpdatePassword(old_password: $oldPassword, new_password: $newPassword) {
      message
      status
    }
  }
`;

export const SAVE_USER_SNAP_INFO = gql`
  mutation UpdateUser($snapchatName: String, $snapchatBitmoji: String) {
    UpdateUser(
      snapchat_name: $snapchatName
      snapchat_bitmoji: $snapchatBitmoji
    ) {
      is_snap_logged_in
      snapchat_bitmoji
    }
  }
`;

export const CREATE_CARD = gql`
  mutation CreateCard(
    $backgroundColor: String!
    $captionText: String
    $textColor: String
    $stickerImage: String
    $backgroundImage: String
    $isPremium: Boolean
    $price: Float
    $category: String
    $responseType: String
    $gradientBackgroundColor: String
    $newTextColor: String
  ) {
    CreateCard(
      background_color: $backgroundColor
      caption_text: $captionText
      text_color: $textColor
      sticker_image: $stickerImage
      background_image: $backgroundImage
      is_premium: $isPremium
      price: $price
      category: $category
      response_type: $responseType
      gradient_background_color: $gradientBackgroundColor
      new_text_color: $newTextColor
    ) {
      _id
      background_color
      gradient_background_color
      background_image
      caption_image
      caption_text
      price
      category
      is_activated
      description
      is_premium
      response_type
      status
      sticker_image
      status_reason
      text_color
      new_text_color
      total_messages_count
      week_title
    }
  }
`;

export const UPLOAD_CONTACTS = gql`
  mutation UploadPhoneContact(
    $name: [String!]
    $phone: [String!]
    $email: [String!]
  ) {
    UploadPhoneContact(name: $name, phone: $phone, email: $email) {
      contacts {
        email
        name
      }
    }
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($password: String!) {
    DeleteAccount(password: $password) {
      message
      status
    }
  }
`;

export const MARK_CARD_AS_PAID = gql`
  mutation MarkCardAsPaid($cardId: String!, $appleReceipt: String!) {
    MarkCardAsPaid(cardId: $cardId, apple_receipt: $appleReceipt) {
      message
      status
    }
  }
`;

export const MARK_USER_AS_PAID = gql`
  mutation MarkUserAsPaid($appleReceipt: String!) {
    MarkUserAsPaid(apple_receipt: $appleReceipt) {
      json
      message
      status
    }
  }
`;

export const MARK_MESSAGE_AS_PAID = gql`
  mutation MarkMessageAsPaid($messageId: String!, $appleReceipt: String!) {
    MarkMessageAsPaid(message_id: $messageId, apple_receipt: $appleReceipt) {
      _id
      answer_audio
      answer_picture
      approx_location
      answer_text
      browser_name
      country_name
      card {
        _id
        background_color
        text_color
        total_messages_count
        response_type
      }
      hints
      ip_address
      is_read
      profile_link
      temporary_sender_user_id
      question
      network_provider
      is_replied
      isPaid
    }
  }
`;

export const MARK_CARD_ANDROID = gql`
  mutation MarkCardAsPaidAndroid($cardId: String!) {
    MarkCardAsPaidAndroid(cardId: $cardId) {
      json
      message
      status
    }
  }
`;

export const MARK_MESSAGE_ANDROID = gql`
  mutation MarkMessageAsPaidAndroid($messageId: String!) {
    MarkMessageAsPaidAndroid(message_id: $messageId) {
      _id
      answer_audio
      answer_picture
      approx_location
      answer_text
      browser_name
      country_name
      card {
        _id
        background_color
        text_color
        total_messages_count
        response_type
      }
      hints
      ip_address
      is_read
      profile_link
      temporary_sender_user_id
      question
      network_provider
      is_replied
      isPaid
    }
  }
`;

export const MARK_USER_ANDROID = gql`
  mutation MarkUserAsPaidAndroid {
    MarkUserAsPaidAndroid {
      status
      json
      message
    }
  }
`;

export const MARK_AUDIO_BLANK_CARD_AS_PAID = gql`
  mutation MarkBlankAudioCardFeatureAsPaid($appleReceipt: String!) {
    MarkBlankAudioCardFeatureAsPaid(apple_receipt: $appleReceipt) {
      json
      message
      status
    }
  }
`;

export const MARK_TEXT_BLANK_CARD_AS_PAID = gql`
  mutation MarkBlankTextCardFeatureAsPaid($appleReceipt: String!) {
    MarkBlankTextCardFeatureAsPaid(apple_receipt: $appleReceipt) {
      json
      message
      status
    }
  }
`;

export const REVENUE_SHARE_WITHDRAWAL_REQUEST = gql`
  mutation CreateRevShareWithdrawalRequest(
    $paymentMethod: String!
    $paymentDetails: String!
  ) {
    CreateRevShareWithdrawalRequest(
      payment_method: $paymentMethod
      payment_details: $paymentDetails
    ) {
      json
      message
      status
    }
  }
`;

export const MARK_USER_DONATION_AS_PAID = gql`
  mutation MarkUserDonationAsPaid($appleReceipt: String!, $restore: Boolean) {
    MarkUserDonationAsPaid(apple_receipt: $appleReceipt, restore: $restore) {
      status
      message
      json
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessageFromDMLinks(
    $msgToken: String!
    $message: String!
    $anonymousUserId: String!
  ) {
    SendMessageFromDMLinks(
      msg_token: $msgToken
      message: $message
      anonymous_user_id: $anonymousUserId
    ) {
      status
      message
    }
  }
`;

export const CREATE_LINK_RECEIVER = gql`
  mutation CreateLinkForDMPaidByUsers($amount: Float!) {
    CreateLinkForDMPaidByUsers(amount: $amount) {
      status
      message
      json
    }
  }
`;
export const CREATE_CHAT_WITH_ME_PRO_LINK = gql`
  mutation CreateLinkForDMPaidByReceiver(
    $amount: Float!
    $appleReceipt: String!
  ) {
    CreateLinkForDMPaidByReceiver(
      amount: $amount
      apple_receipt: $appleReceipt
    ) {
      status
      message
      json
    }
  }
`;

export const MARK_CHAT_AS_READ = gql`
  mutation MarkDMMessagesAsSeen($msgToken: String!, $anonymousUserId: String!) {
    MarkDMMessagesAsSeen(
      msg_token: $msgToken
      anonymous_user_id: $anonymousUserId
    ) {
      status
      message
      json
    }
  }
`;

export const MARK_CHAT_WITH_ME_PRO_AS_PAID = gql`
  mutation MarkChatWithMeFeatureAsPaid(
    $appleReceipt: String!
    $restore: Boolean
  ) {
    MarkChatWithMeFeatureAsPaid(
      apple_receipt: $appleReceipt
      restore: $restore
    ) {
      status
      message
      json
    }
  }
`;

export const DELETE_DM_THREADS = gql`
  mutation DeleteDMThread($msgToken: String!, $anonymousUserId: String!) {
    DeleteDMThread(msg_token: $msgToken, anonymous_user_id: $anonymousUserId) {
      status
      json
      message
    }
  }
`;

export const CARD_LINK_COPIED = gql`
  mutation CardLinkCopied($cardId: String!) {
    CardLinkCopied(card_id: $cardId) {
      status
      json
      message
    }
  }
`;

export const MARK_DM_CHATS_AS_PAID = gql`
  mutation MarkDMChatsAsPaid(
    $msgToken: String!
    $anonymousUserId: String!
    $appleReceipt: String!
  ) {
    MarkDMChatsAsPaid(
      msg_token: $msgToken
      anonymous_user_id: $anonymousUserId
      apple_receipt: $appleReceipt
    ) {
      message
      created_at
      receiver_id
      sender_id
      msg_token
      is_paid
    }
  }
`;

export const SEND_GROUP_MESSAGE = gql`
  mutation SendGroupMessage(
    $groupToken: String!
    $message: String!
    $taggedMessageId: String
  ) {
    SendGroupMessage(
      group_token: $groupToken
      message: $message
      tagged_message_id: $taggedMessageId
    ) {
      status
      json
      message
    }
  }
`;

export const CREATE_GROUP = gql`
  mutation Mutation($groupName: String) {
    CreateGroupChatCard(group_name: $groupName) {
      _id
      group_token
      group_name
      unread_messages
      created_at
    }
  }
`;

export const DELETE_GROUP = gql`
  mutation Mutation($groupToken: String!) {
    DeleteGroupChatCard(group_token: $groupToken) {
      status
    }
  }
`;
