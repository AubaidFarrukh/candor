import { gql } from "@apollo/client";

export const GET_S3_PRESIGNED_URL = gql`
  query GetS3PreSignedUrls($fileNames: [String!]) {
    GetS3PreSignedUrls(fileNames: $fileNames) {
      urls {
        delete
        file
        get
        key
        put
      }
    }
  }
`;

export const LIST_POLL = gql`
  query AdminListPollCards($status: String, $page: Int, $limit: Int) {
    AdminListPollCards(status: $status, page: $page, limit: $limit) {
      _id
      brag_name
      isVoted
      is_paid
      is_selected
      status
      submitted_by {
        _id
        name
      }
      text
      total_votes
      week_title
    }
  }
`;

export const REPORTED_USERS = gql`
  query AdminListReportContent($limit: Int, $page: Int) {
    AdminListReportContent(limit: $limit, page: $page) {
      _id
    }
  }
`;

export const LIST_USER = gql`
  query AdminListUsers($limit: Int, $page: Int) {
    AdminListUsers(limit: $limit, page: $page) {
      _id
      name
      auth_token
      phone
      email
      birthday
      username
      total_poll_count
      poll_count_live
      total_card_count
      card_count_live
      weeks_card_submitted
      weeks_poll_submitted
      status
      referralCount
    }
  }
`;

export const LIST_CARD = gql`
  query AdminListCards($limit: Int, $page: Int, $status: String) {
    AdminListCards(limit: $limit, page: $page, status: $status) {
      _id
      caption_text
      status
      creator {
        name
      }
      is_activated
      price
      linked_poll {
        _id
        brag_name
      }
      is_premium
      background_color
      text_color
      background_image
      sticker_image
      total_messages_count
      category
      response_type
      gradient_background_color
      new_text_color
    }
  }
`;

export const POLL_RESULT = gql`
  query AdminWeeklyStats($limit: Int, $page: Int) {
    AdminWeeklyStats(limit: $limit, page: $page) {
      _id
      name
      polls {
        _id
        brag_name
        isVoted
        is_paid
        is_selected
        status
        submitted_by {
          _id
          name
        }
        text
        total_votes
        week_title
      }
    }
  }
`;
export const FEEDBACK = gql`
  query AdminListFeedback {
    AdminListFeedback {
      _id
      text
      date
      user {
        _id
        username
        name
        avatar
      }
    }
  }
`;

export const REPORTS = gql`
  query AdminListReportContent($limit: Int, $page: Int) {
    AdminListReportContent(limit: $limit, page: $page) {
      _id
      type
      date
      text
      info
      reporter {
        _id
        username
        name
        avatar
      }
    }
  }
`;

export const UPDATES_COUNT = gql`
  query AdminCountUpdates($mediaType: String!) {
    AdminCountUpdates(media_type: $mediaType) {
      count
      data
    }
  }
`;

export const REACTION_COUNT = gql`
  query AdminCountReactionPlus {
    AdminCountReactionPlus {
      count
      data
    }
  }
`;

export const CHALLENGE_POST_COUNT = gql`
  query AdminCountChallengePosts($mediaType: String!) {
    AdminCountChallengePosts(media_type: $mediaType) {
      count
      data
    }
  }
`;

export const CHALLENGE_COUNT = gql`
  query AdminCountChallenges($privacy: String!) {
    AdminCountChallenges(privacy: $privacy) {
      count
      data
    }
  }
`;

export const BATTLE_COUNT = gql`
  query AdminCountBattleChallengePosts {
    AdminCountBattleChallengePosts {
      count
      data
    }
  }
`;

export const TOP_USERS = gql`
  query AdminListTopUsers($limit: Int, $page: Int) {
    AdminListTopUsers(limit: $limit, page: $page) {
      user {
        _id
        username
        name
        avatar
        challenges {
          _id
          hashtag
          likeCount
          viewsCount
          commentCount
          CreationTime
        }
        updates {
          _id
          viewsCount
          media_url
          media_thumbnail
        }
        postCount
      }
      friends
      followers
      reactions
      content
    }
  }
`;

export const LOGIN_ADMIN = gql`
  query LoginUser($email: String!, $password: String!) {
    LoginUser(email: $email, password: $password) {
      _id
      name
      auth_token
    }
  }
`;

export const GET_STATS = gql`
  query AdminStats {
    AdminStats {
      message
      status
      json
    }
  }
`;

export const TRENDING = gql`
  query TrendingContentForBattleChallenge(
    $limit: Int
    $page: Int
    $trendingContentForChallengeLimit2: Int
    $trendingContentForChallengePage2: Int
  ) {
    TrendingContentForBattleChallenge(limit: $limit, page: $page) {
      _id
      hashtag
      creator {
        _id
        username
        name
        avatar
      }
      viewsCount
    }
    TrendingContentForChallenge(
      limit: $trendingContentForChallengeLimit2
      page: $trendingContentForChallengePage2
    ) {
      _id
      hashtag
      creator {
        _id
        username
        name
        avatar
      }
      viewsCount
      CreationTime
      commentCount
      likeCount
      posts {
        _id
        hashtag
        viewsCount
        shareCount
        commentCount
        creator {
          _id
          username
          name
          avatar
        }
        CreationTime
      }
    }
  }
`;

export const USERS_GRAPH = gql`
  query RootQuery {
    AdminUserGraph
  }
`;

export const ACTIVE_USERS_GRAPH = gql`
  query RootQuery {
    AdminActiveUsersGraph
  }
`;

export const CONTENTS_GRAPH = gql`
  query RootQuery {
    AdminContentCreatedGraph
  }
`;

export const GET_USER = gql`
  query User($userId: String!) {
    User(id: $userId) {
      _id
      joinedTime
      username
      name
      avatar
      postCount
      battlesCount
      friendsCount
      followingsCount
      followersCount
      posts {
        _id
        media_url
        media_thumbnail
        hashtag
        likeCount
        viewsCount
        shareCount
        commentCount
        CreationTime
      }
      challenges {
        _id
        hashtag
        CreationTime
        likeCount
        viewsCount
        commentCount
      }
      updates {
        _id
        media_url
        media_thumbnail
        viewsCount
      }
    }
  }
`;

export const GET_BATTLE = gql`
  query BattleChallengePostsByUserId(
    $userId: String!
    $limit: Int
    $page: Int
  ) {
    BattleChallengePostsByUserId(userId: $userId, limit: $limit, page: $page) {
      _id
      media_thumbnail
      media_url
      CreationTime
      hashtag
      likesCount
      viewsCount
      commentCount
      sharesCount
    }
  }
`;

// export const GET_REACTIONS = gql``;

export const GET_POST = gql`
  query Post($postId: String!) {
    Post(id: $postId) {
      _id
      media_type
      CreationTime
      media_url
      media_thumbnail
      audio_text
      audio_url
      commentCount
      shareCount
      viewsCount
      likeCount
      hashtag
      creator {
        _id
        username
        name
        avatar
      }
    }
  }
`;

export const GET_BATTLE_ID = gql`
  query BattleChallengePostsByPostId($postId: String!) {
    BattleChallengePostsByPostId(postId: $postId) {
      _id
      media_type
      CreationTime
      media_url
      media_thumbnail
      audio_text
      audio_url
      commentCount
      sharesCount
      viewsCount
      likesCount
      hashtag
      creator {
        _id
        username
        name
        avatar
      }
    }
  }
`;

export const SEND_SMS = gql`
  query AdminSendPromotionalSMS($message: String!, $countryCode: String) {
    AdminSendPromotionalSMS(message: $message, countryCode: $countryCode) {
      status
      message
    }
  }
`;

export const COUNT_PHONE = gql`
  query AdminCountPhoneContact($countryCode: String) {
    AdminCountPhoneContact(countryCode: $countryCode) {
      count
      data
    }
  }
`;

export const TRENDING_CARD = gql`
  query AdminListTrendingCards($page: Int, $limit: Int) {
    AdminListTrendingCards(page: $page, limit: $limit) {
      _id
      caption_text
      total_messages_count
    }
  }
`;

export const GET_PHONEBOOK = gql`
  query PhoneContactList(
    $limit: Int
    $page: Int
    $query: String
    $type: String
  ) {
    PhoneContactList(limit: $limit, page: $page, query: $query, type: $type) {
      _id
      email
      name
      phone
      uploadedBy {
        _id
      }
      userInfo {
        _id
      }
    }
  }
`;

export const GET_REV_SHARE = gql`
  query AdminListRevSharePaymentRequests($limit: Int, $page: Int) {
    AdminListRevSharePaymentRequests(limit: $limit, page: $page) {
      _id
      user_id
      amount
      status
      created_at
      updated_at
    }
  }
`;

export const LIST_REV = gql`
  query AdmminListPaymentTransactions($limit: Int, $page: Int) {
    AdmminListPaymentTransactions(limit: $limit, page: $page) {
      _id
      user {
        _id
        name
      }
      transactionId
      productId
      purchaseDate
      created_at
    }
  }
`;

export const LIST_REV_USERS = gql`
  query AdminListRevShareUsers($limit: Int, $page: Int) {
    AdminListRevShareUsers(limit: $limit, page: $page) {
      _id
      name
      phone
      email
      birthday
      username
      referral
      total_earnings
      pending_earnings
      rev_share
      is_premium
      status
    }
  }
`;
