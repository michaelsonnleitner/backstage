/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { customPageTheme } from '@backstage/theme';
import React, { FC, useState } from 'react';
import {
  Content,
  ContentHeader,
  Header,
  SupportButton,
  Page,
  Progress,
  HeaderLabel,
  useApi,
  githubAuthApiRef,
} from '@backstage/core';

import ClusterTable from '../ClusterTable/ClusterTable';
import { Button } from '@material-ui/core';
import { useAsync } from 'react-use';
import { gitOpsApiRef } from '../../api';
import { Alert } from '@material-ui/lab';

const ClusterList: FC<{}> = () => {
  const api = useApi(gitOpsApiRef);
  const githubAuth = useApi(githubAuthApiRef);
  const [githubUsername, setGithubUsername] = useState(String);

  const { loading, error, value } = useAsync(async () => {
    const accessToken = await githubAuth.getAccessToken(['repo', 'user']);
    if (!githubUsername) {
      const userInfo = await api.fetchUserInfo({ accessToken });
      setGithubUsername(userInfo.login);
    }
    return api.listClusters({
      gitHubToken: accessToken,
      gitHubUser: githubUsername,
    });
  });
  let content: JSX.Element;
  if (loading) {
    content = (
      <Content>
        <Progress />
      </Content>
    );
  } else if (error) {
    content = (
      <Content>
        <div>
          <Alert severity="error">
            Error encountered while fetching list of GitOps-managed cluster.{' '}
            {error.toString()}
          </Alert>
          <Alert severity="info">
            Please make sure that you start GitOps-API backend on localhost port
            3008 before using this plugin.
          </Alert>
        </div>
      </Content>
    );
  } else {
    content = (
      <Content>
        <ContentHeader title="Clusters">
          <Button
            variant="contained"
            color="primary"
            href="/gitops-cluster-create"
          >
            Create GitOps-managed Cluster
          </Button>
          <SupportButton>All clusters</SupportButton>
        </ContentHeader>
        <ClusterTable components={value!.result} />
      </Content>
    );
  }

  return (
    <Page pageTheme={customPageTheme.pageTheme.home}>
      <Header title="GitOps-managed Clusters">
        <HeaderLabel label="Welcome" value={githubUsername} />
      </Header>
      {content}
    </Page>
  );
};

export default ClusterList;
